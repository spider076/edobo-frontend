"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography
} from "@mui/material";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLocation } from "src/redux/slices/user";

const LocationPopup = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [locationAccess, setLocationAccess] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  });

  const dispatch = useDispatch();
  const location = window?.localStorage.getItem("location")
    ? JSON.parse(window.localStorage.getItem("location"))
    : null;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLEMAPS_APIKEY,
    libraries: ["places"]
  });

  let geocoder;
  if (isLoaded) {
    geocoder = new window.google.maps.Geocoder();
  }

  const handleAllowLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocationAccess(coords);
          fetchAddressFromCoords(coords);
        },
        (error) => {
          console.log("Location permission denied:", error);
          setIsVisible(false);
          onClose();
        }
      );
    }
  };

  const fetchAddressFromCoords = (coords) => {
    if (!geocoder) return;
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        setSearchInput(results[0].formatted_address);
      } else {
        console.error("Geocoder failed: ", status);
      }
    });
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setLocationAccess(coords);
        setSearchInput(place.formatted_address || "");

        // Extract address components
        const addressComponents = place.address_components;
        const newAddress = {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: ""
        };

        addressComponents.forEach(component => {
          const type = component.types[0];
          if (type === "street_number" || type === "route") {
            newAddress.street += component.long_name + " ";
          }
          if (type === "locality") {
            newAddress.city = component.long_name;
          }
          if (type === "administrative_area_level_1") {
            newAddress.state = component.long_name;
          }
          if (type === "postal_code") {
            newAddress.postalCode = component.long_name;
          }
          if (type === "country") {
            newAddress.country = component.long_name;
          }
        });

        setAddress(newAddress);
      }
    }
  };

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    const locationData = {
      fullAddress: searchInput,
      coordinates: locationAccess,
      ...address
    };

    // Dispatch to Redux and save to localStorage
    dispatch(setLocation(locationData));
    window.localStorage.setItem("location", JSON.stringify(locationData));

    console.log("Address Submitted:", locationData);
    onClose();
  };

  useEffect(() => {
    if (!isVisible) onClose();
  }, [isVisible, onClose, locationAccess]);

  useEffect(() => {
    handleAllowLocation();
  }, []);

  // if (location) return null;

  if (!isVisible || !isLoaded) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "600px",
        overflowY: "scroll",
        p: 2,
        bgcolor: "white",
        color: "black",
        boxShadow: 3,
        borderRadius: 2,
        zIndex: 1000,
        textAlign: "center",
      }}
    >
      <IconButton
        onClick={() => setIsVisible(false)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8
        }}
      >
        <CloseIcon />
      </IconButton>
      <IconButton
        onClick={() => setIsVisible(false)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" gutterBottom>
        Allow Location Access
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        We need your location to provide the best shopping experience.
      </Typography>
      {!locationAccess ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleAllowLocation}
        >
          Allow Location
        </Button>
      ) : (
        <Grid container spacing={2}>
          {/* Non Mobile Screens */}
          <Grid item xs={12} md={6} lg={6}>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                onLoad={(auto) => setAutocomplete(auto)}
                onPlaceChanged={handlePlaceChanged}
              >
                <TextField
                  label="Search Location"
                  variant="outlined"
                  InputProps={{
                    style: { color: "black" }
                  }}
                  color="primary"
                  fullWidth
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  margin="normal"
                />
              </Autocomplete>
            </Box>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "200px" }}
              center={locationAccess}
              zoom={12}
            >
              <Marker position={locationAccess} />
            </GoogleMap>
          </Grid>
          <Grid
            container
            item
            xs={12}
            md={6}
            lg={6}
            sx={{
              "@media (max-width:600px)": {
                flexDirection: "row",
                flexWrap: "no-wrap",
                "& .MuiTextField-root": {
                  width: "calc(50% - 16px)",
                  margin: "8px"
                }
              }
            }}
          >
            {/* <Typography variant="h6" display="hidden" gutterBottom>
              Enter Address Details
            </Typography> */}
            <TextField
              label="Street"
              name="street"
              value={address.street}
              InputProps={{
                style: { color: "black" }
              }}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              name="city"
              InputProps={{
                style: { color: "black" }
              }}
              value={address.city}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="State"
              name="state"
              InputProps={{
                style: { color: "black" }
              }}
              value={address.state}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Postal Code"
              name="postalCode"
              InputProps={{
                style: { color: "black" }
              }}
              value={address.postalCode}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              name="country"
              InputProps={{
                style: { color: "black" }
              }}
              value={address.country}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Grid>

          {/* Mobile Screens */}
          {/* <Grid item xs={12} sm={12} md={12} lg={12}>
            <Box sx={{ mb: 2 }}>
              <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceChanged}>
                <TextField
                  label="Search Location"
                  variant="outlined"
                  fullWidth
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  margin="normal"
                />
              </Autocomplete>
            </Box>
          </Grid> */}
        </Grid>
      )}
    </Box>
  );
};

export default LocationPopup;
