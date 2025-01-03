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
import axios from 'axios';
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

// Razorpay Configuration
const RAZORPAY_CONFIG = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Pu2pvCuPYnstgx', // Fallback to test key
  currency: 'INR',
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Edobo Medical',
  description: 'Order Payment',
  image: '/logo.png',
  theme: {
    color: '#F37254'
  }
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
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

  // Combine both mutations into a single one for better state management
  const { mutate: handleOrder, isLoading: isOrderProcessing } = useMutation(
    async (orderData) => {
      if (orderData.paymentMethod === 'razorpay') {
        const orderResponse = await api.placeOrder(orderData);
        if (orderResponse.success) {
          return handleRazorpayPayment(orderResponse, orderData);
        }
        throw new Error(orderResponse.message || 'Failed to create order');
      }
      return api.placeOrder(orderData);
    },
    {
      onSuccess: (data) => {
        toast.success('Order placed successfully!');
        setProcessingTo(false);
        router.push(`/order/${data.orderId}`);
        dispatch(resetCart());
      },
      onError: (error) => {
        toast.error(error.message || 'Something went wrong');
        setProcessingTo(false);
      }
    }
  );

  // Separate Razorpay payment logic
  const handleRazorpayPayment = async (razorpayData, orderData) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure Razorpay script is loaded
        await loadRazorpayScript();

        // Check if Razorpay is properly loaded       
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK failed to load');
        }

        const options = {
          ...RAZORPAY_CONFIG,
          amount: Math.round(cCurrency(totalWithDiscount || checkout.total) * 100), // Ensure amount is rounded
          order_id: razorpayData.orderId,
          prefill: {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            contact: values.phone
          },
          handler: function (response) {
            resolve({
              ...orderData,
              paymentId: response.razorpay_payment_id,
              orderId: razorpayData.orderId
            });
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (response) {
          reject(new Error(response.error.description || 'Payment failed'));
        });
        razorpayInstance.open();
      } catch (error) {
        console.error('Razorpay Error:', error);
        reject(new Error(error.message || 'Failed to initialize Razorpay'));
      }
    });
  };

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
      try {
        setProcessingTo(true);
        setCheckoutError(null);

        const items = cart.map(({ ...others }) => others);
        const totalItems = sum(items.map((item) => item.quantity));

        const orderData = {
          paymentMethod,
          items,
          user: values,
          totalItems,
          couponCode,
          shipping: process.env.NEXT_PUBLIC_SHIPPING_FEE || 0
        };

        handleOrder(orderData);
      } catch (error) {
        setProcessingTo(false);
        setCheckoutError(error.message || 'Checkout failed');
      }
    }
  });

  const { errors, values, touched, handleSubmit, getFieldProps, isValid } = formik;

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

  const [loading, setLoading] = React.useState(true);

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
                  loading={isOrderProcessing || isProcessing || loading}
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
