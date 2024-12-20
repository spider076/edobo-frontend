'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next-nprogress-bar';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { sum } from 'lodash';
// mui
import { Box, Collapse, Grid } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// yup
import * as Yup from 'yup';
// formik
import { useFormik, Form, FormikProvider } from 'formik';
// api
import * as api from 'src/services';
// stripe
import { useStripe, useElements } from '@stripe/react-stripe-js';

// Componensts
import { resetCart, getCart } from 'src/redux/slices/product';
import PayPalPaymentMethod from 'src/components/paypal/paypal';
import countries from './countries.json';
import CheckoutGuestFormSkeleton from '../skeletons/checkout/checkoutForm';
import PaymentInfoSkeleton from '../skeletons/checkout/paymentInfo';
import PaymentMethodCardSkeleton from '../skeletons/checkout/paymentMethod';
import CardItemSekelton from '../skeletons/checkout/cartItems';
// hooks
import { useCurrencyConvert } from 'src/hooks/convertCurrency';
// paypal
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Razorpay from 'razorpay';
// dynamic components
const CheckoutForm = dynamic(() => import('src/components/forms/checkout'), {
  loading: () => <CheckoutGuestFormSkeleton />
});
const ShipmentCheckoutForm = dynamic(() => import('src/components/forms/shipmentAddress'), {
  loading: () => <CheckoutGuestFormSkeleton />
});
const PaymentInfo = dynamic(() => import('src/components/_main/checkout/paymentInfo'), {
  loading: () => <PaymentInfoSkeleton />
});
const PaymentMethodCard = dynamic(() => import('src/components/_main/checkout/paymentMethod'), {
  loading: () => <PaymentMethodCardSkeleton />
});

const CartItemsCard = dynamic(() => import('src/components/cards/cartItems'), {
  loading: () => <CardItemSekelton />
});

const initialOptions = {
  'client-id': process.env.PAYPAL_CLIENT_ID,
  'disable-funding': 'paylater',
  vault: 'true',
  intent: 'capture'
};

const CheckoutMain = () => {
  const router = useRouter();
  const cCurrency = useCurrencyConvert();
  const dispatch = useDispatch();
  const { currency, rate } = useSelector(({ settings }) => settings);
  const { checkout } = useSelector(({ product }) => product);
  const { user: userData } = useSelector(({ user }) => user);
  const { cart, total } = checkout;
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checked, setChecked] = React.useState(false);

  const handleChangeShipping = (event) => {
    setChecked(event.target.checked);
  };

  const [couponCode, setCouponCode] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isProcessing, setProcessingTo] = useState(false);

  const [totalWithDiscount, setTotalWithDiscount] = useState(null);
  const elements = useElements();
  const stripe = useStripe();
  const { mutate, isLoading } = useMutation('order', api.placeOrder, {
    onSuccess: (data) => {
      toast.success('Order placed!');
      setProcessingTo(false);
      router.push(`/order/${data.orderId}`);
      dispatch(resetCart());
    },
    onError: (err) => {
      toast.error(err.response.data.message || 'Something went wrong');
      setProcessingTo(false);
    }
  });

  const [loading, setLoading] = React.useState(true);
  const { mutate: getCartMutate } = useMutation(api.getCart, {
    onSuccess: (res) => {
      dispatch(getCart(res.data));
      setLoading(false);
    },
    onError: (err) => {
      const message = JSON.stringify(err.response.data.message);
      setLoading(false);
      toast.error(message ? JSON.parse(message) : 'Something went wrong!');
    }
  });

  React.useEffect(() => {
    formik.validateForm();
    if (cart.length < 1) {
      router.push('/');
    } else {
      setLoading(true);
      getCartMutate(cart);
    }
  }, []);

  const NewAddressSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phone: Yup.string().required('Phone is required'),
    email: Yup.string().email('Enter email Valid').required('Email is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    zip: Yup.string().required('Postal is required'),
    shippingAddress: checked
      ? Yup.object().shape({
          firstName: Yup.string().required('First name is required'),
          lastName: Yup.string().required('Last name is required'),
          phone: Yup.string().required('Phone is required'),
          email: Yup.string().email('Enter email Valid').required('Email is required'),
          address: Yup.string().required('Address is required'),
          city: Yup.string().required('City is required'),
          state: Yup.string().required('State is required'),
          country: Yup.string().required('Country is required'),
          zip: Yup.string().required('Postal is required')
        })
      : Yup.string().nullable().notRequired()
  });

  // Define initial values
  const formik = useFormik({
    initialValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      phone: userData?.phone || '',
      email: userData?.email || '',
      address: userData?.address || '',
      city: userData?.city || '',
      state: userData?.state || '',
      country: userData?.country || 'India',
      zip: userData?.zip || '',
      note: '',
      ...(checked && {
        shippingAddress: {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          zip: ''
        }
      })
    },
    enableReinitialize: true,
    validationSchema: NewAddressSchema,
    onSubmit: async (values) => {
      console.log('button pressed', values);
      const items = cart.map(({ ...others }) => others);
      const totalItems = sum(items.map((item) => item.quantity));

      const data = {
        paymentMethod: paymentMethod,
        items: items,
        user: values,
        totalItems,
        couponCode,
        currency,
        conversionRate: rate,
        shipping: process.env.SHIPPING_FEE || 0
      };

      if (data.paymentMethod === 'razorpay') {
        onRazorpaySubmit(data);
      } else {
        mutate(data);
      }
    }
  });

  const { errors, values, touched, handleSubmit, getFieldProps, isValid } = formik;

  const onRazorpaySubmit = async (data) => {
    try {
      console.log('Opening Razorpay checkout...');
      setProcessingTo(true); // Set loading state
      setCheckoutError(null); // Reset checkout errors

      // Find selected country from available countries
      const selected = countries.find((v) => v.label.toLowerCase() === values.country.toLowerCase());

      // Prepare billing details
      const billingDetails = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        address: {
          city: values.city,
          line1: values.address,
          state: values.state,
          postal_code: values.zip,
          country: selected?.code.toLowerCase() || 'in' // Default to 'in' if country code is not found
        }
      };

      // Razorpay payment options
      const options = {
        key: 'rzp_test_Pu2pvCuPYnstgx', // Replace with your Razorpay key
        amount: cCurrency(totalWithDiscount || checkout.total) * 100, // Convert amount to paise
        currency: 'INR', // Currency type, e.g., 'INR'
        name: 'Your Business Name', // Business name
        description: 'Order Payment', // Payment description
        image: '/logo.png', // Business logo
        order_id: '135121313', // Razorpay order ID
        prefill: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          contact: values.phone // Prefill contact details
        },
        handler: function (response) {
          // Handle Razorpay payment response
          mutate({
            ...data,
            paymentMethod: 'Razorpay',
            paymentId: response.razorpay_payment_id // Capture payment ID
          });
        },
        theme: {
          color: '#F37254' // Customize theme color
        }
      };

      // Ensure Razorpay instance is created only if options are correct
      if (!options.key) {
        throw new Error('Razorpay key is missing!');
      }

      const razorpayInstance = new Razorpay(options); // Create Razorpay instance
      razorpayInstance.open(); // Open Razorpay payment modal
    } catch (error) {
      setProcessingTo(false); // Stop processing state
      setCheckoutError(error.message || 'An error occurred during the checkout process');
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Box py={5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <CheckoutForm
                getFieldProps={getFieldProps}
                touched={touched}
                errors={errors}
                values={values}
                handleChangeShipping={handleChangeShipping}
                checked={checked}
              />
              <Collapse in={checked}>
                <ShipmentCheckoutForm getFieldProps={getFieldProps} touched={touched} errors={errors} />
              </Collapse>
            </Grid>
            <Grid item xs={12} md={4}>
              <CartItemsCard cart={cart} loading={loading} />
              <PaymentInfo loading={loading} setCouponCode={setCouponCode} setTotal={(v) => setTotalWithDiscount(v)} />
              <PaymentMethodCard
                loading={loading}
                value={paymentMethod}
                setValue={setPaymentMethod}
                error={checkoutError}
              />
              <br />
              <Collapse in={paymentMethod !== 'paypal'}>
                <LoadingButton
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                  loading={isLoading || isProcessing || loading}
                >
                  Place Order
                </LoadingButton>
              </Collapse>
            </Grid>
          </Grid>
        </Box>
      </Form>
    </FormikProvider>
  );
};

export default CheckoutMain;
