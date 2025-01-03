'use client';
// react
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// mui
import { useMediaQuery } from '@mui/material';

// api
import * as api from 'src/services';
import { useQuery } from 'react-query';
// components
import ProductList from './productList';
import SortBar from './sortbar';
ProductListing.propTypes = {
  category: PropTypes.object,
  subCategory: PropTypes.object,
  shop: PropTypes.object
};
// dynamic components
const Pagination = dynamic(() => import('src/components/pagination'));

const sortData = [
  { title: 'Top Rated', key: 'top', value: -1 },
  { title: 'Asceding', key: 'name', value: 1 },
  { title: 'Desceding', key: 'name', value: -1 },
  { title: 'Price low to high', key: 'price', value: 1 },
  { title: 'Price high to low', key: 'price', value: -1 },
  { title: 'Oldest', key: 'date', value: 1 },
  { title: 'Newest', key: 'date', value: -1 }
];
const getSearchParams = (searchParams) => {
  const params = new URLSearchParams(searchParams.toString());
  return params.toString() ? '?' + params.toString() : '';
};

export default function ProductListing({ category, subCategory, shop, compaign }) {
  const searchParams = useSearchParams();
  const { rate } = useSelector(({ settings }) => settings);
  const [userLocation, setUserLocation] = React.useState(null);

  React.useEffect(() => {
    const storedLocation = window?.localStorage.getItem('location');
    if (storedLocation) {
      const locationData = JSON.parse(storedLocation);
      if (locationData.city) {
        locationData.city = locationData.city.trim();
      }
      setUserLocation(locationData);
    }
  }, []);

  console.log('location from localStorage: ', userLocation);

  const { data, isLoading } = useQuery(
    [
      'products' + (category || subCategory ? '-with-category' : ''),
      searchParams.toString(),
      category,
      subCategory,
      shop,
      compaign,
      rate,
      userLocation?.city
    ],
    () => {
      const queryParams = getSearchParams(searchParams);
      
      if (category) {
        return api.getProductsByCategory(queryParams, category.slug, rate, userLocation?.city);
      }
      if (subCategory) {
        return api.getProductsBySubCategory(queryParams, subCategory.slug, rate, userLocation?.city);
      }
      if (shop) {
        return api.getProductsByShop(queryParams, shop.slug, rate, userLocation?.city);
      }
      if (compaign) {
        return api.getProductsByCompaign(queryParams, compaign.slug, rate, userLocation?.city);
      }
      return api.getProducts(queryParams, rate, userLocation?.city);
    }
  );
  console.log("pdotucst data : ", data);
  const isMobile = useMediaQuery('(max-width:900px)');
  return (
    <>
      <SortBar
        sortData={sortData}
        productData={data}
        category={subCategory?.parentCategory || category}
        shop={shop}
        subCategory={subCategory}
        isLoading={isLoading}
        compaign={compaign}
      />
      <ProductList data={data} isLoading={isLoading} isMobile={isMobile} />
      <Pagination data={data} />
    </>
  );
}
