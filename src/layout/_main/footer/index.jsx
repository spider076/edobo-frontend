'use client';
import React from 'react';
import NextLink from 'next/link';

// mui
import { alpha, useTheme } from '@mui/material/styles';
import { Typography, Container, Stack, Box, IconButton, Grid, Link, Fab, Divider } from '@mui/material';

// components
import NewsLetter from './newsletter';
import Logo from 'src/components/logo';

// icons
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { MdOutlineLocationOn } from 'react-icons/md';
import { FiMail } from 'react-icons/fi';
import { MdOutlineCall } from 'react-icons/md';

const SOCIAL_MEDIA_LINK = [
  {
    linkPath: 'https://www.facebook.com/techgater',
    icon: <FaFacebookF size={18} />
  },
  {
    linkPath: 'https://www.instagram.com/techgater',
    icon: <FaInstagram size={18} />
  },
  {
    linkPath: 'https://www.linkedin.com/company/89683736/admin',
    icon: <FaLinkedinIn size={18} />
  }
];

const ADDRESS = [
  {
    name: 'Azad Nagar, Chembur, Mumbai, Maharashtra 40007',
    icon: <MdOutlineLocationOn />
  },
  {
    name: 'info@edobo.in',
    linkPath: '/',
    icon: <FiMail fontSize={20} />
  },
  {
    name: '09089089084',
    linkPath: '/',
    icon: <MdOutlineCall />
  }
];

const MAIN_LINKS = [
  {
    heading: 'Resources',
    listText1: 'Contact us',
    listLink1: '/contact',
    listText2: 'Products',
    listLink2: '/products',
    listText3: 'Shops',
    listLink3: '/shops',
    listText4: 'Compaigns',
    listLink4: '/compaigns'
  },
  {
    heading: 'About us',
    listText1: 'About us',
    listLink1: '/about',
    listText2: 'Privacy policy',
    listLink2: '/privacy-policy',
    listText3: 'Term and conditions',
    listLink3: '/terms-and-conditions',
    listText4: 'Refund return policy',
    listLink4: '/refund-return-policy'
  }
];

export default function Footer() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.info.light, 0.1),
        py: 4,
        mt: 7,
        overflow: 'hidden',
        position: 'relative',

        display: {
          md: 'block',
          xs: 'none'
        }
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item md={3}>
            <Stack spacing={3}>
              <Logo />
              <Typography variant="body1" color="text.secondary"></Typography>
              <Stack>
                {ADDRESS.map((item, idx) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} key={idx}>
                    <IconButton
                      sx={{
                        svg: {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {item.icon}
                    </IconButton>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      component={NextLink}
                      href={`${item.linkPath}`}
                      sx={{
                        ':hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>
          {MAIN_LINKS.map((item, idx) => (
            <Grid item md={2} key={idx}>
              <Stack spacing={3}>
                <Typography variant="h4" color="text.primary">
                  {item.heading}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Link
                    href={`${item.listLink1}`}
                    component={NextLink}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: '0.3s ease-in-out',
                      ':hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(10px)'
                      }
                    }}
                  >
                    {item.listText1}
                  </Link>
                  <Link
                    href={`${item.listLink2}`}
                    component={NextLink}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: '0.3s ease-in-out',
                      ':hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(10px)'
                      }
                    }}
                  >
                    {item.listText2}
                  </Link>
                  <Link
                    href={`${item.listLink3}`}
                    component={NextLink}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: '0.3s ease-in-out',
                      ':hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(10px)'
                      }
                    }}
                  >
                    {item.listText3}
                  </Link>
                  <Link
                    href={`${item.listLink4}`}
                    component={NextLink}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: '0.3s ease-in-out',
                      ':hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(10px)'
                      }
                    }}
                  >
                    {item.listText4}
                  </Link>
                  <Link
                    href={`${item.listLink5}`}
                    component={NextLink}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: '0.3s ease-in-out',
                      ':hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateX(10px)'
                      }
                    }}
                  >
                    {item.listText5}
                  </Link>
                </Box>
              </Stack>
            </Grid>
          ))}

          <Grid item md={5}>
            <Stack spacing={3}>
              <Typography variant="h4" color="text.primary">
                Join a Newsletter
              </Typography>
              <NewsLetter />

              <Stack direction="row" alignItems="center" spacing={2}>
                {SOCIAL_MEDIA_LINK.map((item, idx) => (
                  <Fab
                    size="small"
                    color="primary"
                    key={idx}
                    component={NextLink}
                    href={item.linkPath}
                    sx={{
                      zIndex: 1
                    }}
                  >
                    {item.icon}
                  </Fab>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" color="text.primary" textAlign="center">
          © 2024 Edobo. All rights reserved
        </Typography>
      </Container>
    </Box>
  );
}
