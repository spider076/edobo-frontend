"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import LocationPopup from "src/components/_main/home/locationPopup";

// mui
import { Container } from "@mui/material"; // Importing Container component from MUI (Material-UI) library.

// components
import Hero from "src/components/_main/home/hero"; // Importing the Hero component.
import TopBanners from "src/components/_main/home/topBanners"; // Importing the TopBanners component.
import WhyUs from "src/components/_main/home/whyUs"; // Importing the WhyUs component.
import MobileNav from "src/components/_main/home/topBanners/mobileNav";

// Dynamic imports
const Categories = dynamic(
  () => import("src/components/_main/home/categories")
);
const BestSellingProducs = dynamic(
  () => import("src/components/_main/home/bestSelling")
);
const Banner = dynamic(() => import("src/components/_main/home/banner"));
const Brands = dynamic(() => import("src/components/_main/home/brands"));
const TopCollection = dynamic(() => import("src/components/_main/home/top"));
const Shops = dynamic(() => import("src/components/_main/home/shop"));
const Compaigns = dynamic(() => import("src/components/_main/home/compaign"));
const Testimonials = dynamic(
  () => import("src/components/_main/home/testimonials")
);
const FeaturedProducts = dynamic(
  () => import("src/components/_main/home/featured")
);
const SubscriptionModal = dynamic(
  () => import("src/components/_main/home/subscription"),
  {
    ssr: false
  }
);

export default function IndexPage() {
  const [showLocationPopup, setShowLocationPopup] = useState(true);

  const handleLocationPopupClose = () => setShowLocationPopup(false);

  return (
    <>
      {showLocationPopup && (
        <LocationPopup onClose={handleLocationPopupClose} />
      )}
      <Container maxWidth="xl">
        <MobileNav />
        <Hero />
      </Container>
      {/* <TopBanners /> */}
      <Container maxWidth="xl">
        <WhyUs />
        <Categories />
        <BestSellingProducs />
        <Compaigns />
      </Container>
      <Banner />
      <Container maxWidth="xl">
        <TopCollection />
        {/* <Shops /> */}
        {/* <FeaturedProducts /> */}
      </Container>
      <Testimonials />
      <Container maxWidth="xl">
        {/* <Brands /> */}
      </Container>
      {/* <SubscriptionModal /> */}
    </>
  );
}
