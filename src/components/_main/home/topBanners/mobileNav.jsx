"use client";

import { ArrowDropDown } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { BiUser, BiUserCircle } from "react-icons/bi";
import { useSelector } from "react-redux";
import { UserList } from "src/components/lists";
import MenuPopover from "src/components/popover/popover";
import { useMediaQuery } from "@mui/material";
import LoginPopover from "src/components/popover/login";
import LocationPopup from "../locationPopup";

const MobileNav = () => {
  const { user, isAuthenticated } = useSelector(({ user }) => user);
  const [openUser, setOpen] = React.useState(false);
  const [openLogin, setOpenLogin] = React.useState(false);

  const isMobile = useMediaQuery("(max-width:768px)");

  const [showLocationPopup, setShowLocationPopup] = React.useState(true);

  const handleLocationPopupClose = () => setShowLocationPopup(false);

  const router = useRouter();
  const anchorRef = React.useRef(null);

  const handleOpenUser = () => {
    setShowLocationPopup(true);
  };

  const handleCloseUser = () => {
    setOpen(false);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Box>
      <Stack
        direction="row"
        padding={1}
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
        mr={1}
        borderBottom={1}
        borderColor={"black"}
      >
        <BiUserCircle color="red" size={35} />
        <Stack direction="column" spacing={-1} alignItems="flex-start">
          <Typography
            variant="body2"
            fontWeight={400}
            fontSize={15}
            color="error"
            ref={anchorRef}
          >
            Welcome,{" "}
            {isAuthenticated ? user.firstName + " " + user.lastName : "Guest"}
            <span
              style={{ marginLeft: 2, fontWeight: 600, cursor: "pointer" }}
              onClick={() => {
                setOpenLogin(true);
              }}
            >
              {!isAuthenticated && "( Login )"}
            </span>
          </Typography>
          <Typography
            variant="body2"
            fontWeight={400}
            fontSize={15}
            color="error"
            style={{
              display: "flex",
              alignItems: "end"
            }}
          >
            Deliver to{" "}
            <span
              onClick={handleOpenUser}
              style={{
                marginLeft: 4,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              Select the pincode
              <ArrowDropDown style={{ marginLeft: 4 }} />
            </span>
          </Typography>
        </Stack>
      </Stack>
      <MenuPopover
        open={openUser}
        onClose={handleCloseUser}
        anchorEl={anchorRef.current}
        sx={{
          width: 300
        }}
      >
        <UserList
          openUser={openUser}
          isAuthenticated={isAuthenticated}
          user={user}
          setOpen={() => setOpen(false)}
        />
      </MenuPopover>
      <LoginPopover open={openLogin} onClose={() => setOpenLogin(false)} />
      {showLocationPopup && (
        <LocationPopup onClose={handleLocationPopupClose} />
      )}
    </Box>
  );
};

export default MobileNav;
