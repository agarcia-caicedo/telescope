import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Fab, Grid, Typography } from '@material-ui/core';
import useSiteMetadata from '../../hooks/use-site-metadata';
import DynamicBackgroundContainer from '../DynamicBackgroundContainer';

const useStyles = makeStyles((theme) => ({
  h1: {
    position: 'absolute',
    color: theme.palette.text.primary,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: '12rem',
    display: 'block',
    top: theme.spacing(20),
    left: theme.spacing(8),
    [theme.breakpoints.between('xs', 'sm')]: {
      fontSize: '4rem',
      textAlign: 'left',
      left: theme.spacing(4),
      right: theme.spacing(4),
      top: theme.spacing(14),
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '8rem',
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: '12rem',
    },
  },
  heroBanner: {
    height: '100vh',
  },
  stats: {
    position: 'absolute',
    color: theme.palette.text.primary,
    fontFamily: 'Roboto',
    fontSize: '2rem',
    display: 'block',
    bottom: theme.spacing(12),
    left: theme.spacing(8),
    right: theme.spacing(8),
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
    transition: 'all linear 1s',
    [theme.breakpoints.between('xs', 'sm')]: {
      textAlign: 'left',
      fontSize: '2rem',
      left: theme.spacing(4),
      right: theme.spacing(4),
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '4rem',
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: '8rem',
    },
  },

  version: {
    position: 'absolute',
    opacity: 0.85,
    bottom: theme.spacing(6),
    left: theme.spacing(8),
    fontSize: '1.75rem',
    color: theme.palette.text.primary,
    [theme.breakpoints.between('xs', 'sm')]: {
      left: theme.spacing(4),
      right: theme.spacing(4),
      fontSize: '1.75rem',
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: '2rem',
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: '4rem',
    },
    textDecorationLine: 'none',
    '&:hover': {
      textDecorationLine: 'underline',
    },
  },
  icon: {
    height: '5.6rem',
    width: '5.6rem',
    position: 'relative',
    bottom: theme.spacing(20),
    zIndex: 300,
    margin: '0 auto',
    [theme.breakpoints.between('xs', 'sm')]: {
      left: '55%',
      bottom: theme.spacing(18),
    },
  },
  addYours: {
    color: theme.palette.text.primary,
    textDecorationLine: 'underline',
  },
  dynamic: {
    transition: 'opacity 1s ease-in-out',
    backgroundColor: theme.palette.primary.main,
  },
}));

function ScrollDown(props) {
  const { children } = props;

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div onClick={handleClick} role="presentation">
      {children}
    </div>
  );
}

function RetrieveBannerDynamicAssets() {
  const [stats, setStats] = useState({ stats: { posts: 0, authors: 0, words: 0 } });
  const [transitionBackground, setTransitionBackground] = useState(true);
  const classes = useStyles();
  const { telescopeUrl } = useSiteMetadata();

  useEffect(() => {
    async function getStats() {
      const response = await fetch(`${telescopeUrl}/stats/year`);

      if (response.status !== 200) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      const localeStats = {
        posts: data.posts.toLocaleString(),
        authors: data.authors.toLocaleString(),
        words: data.words.toLocaleString(),
      };
      setStats(localeStats);
      setTransitionBackground(false);
    }

    getStats();
  }, [telescopeUrl]);

  if (stats.authors !== 0) {
    return (
      <div
        className={classes.dynamic}
        style={{
          opacity: transitionBackground ? 0 : 0.9,
        }}
      >
        <DynamicBackgroundContainer />
        <Typography variant="caption" className={classes.stats}>
          This year {stats.authors} of us have written {stats.words} words and counting.{' '}
          <Link className={classes.addYours} to="/myfeeds">
            Add yours!
          </Link>
        </Typography>
      </div>
    );
  }

  return null;
}

ScrollDown.propTypes = {
  children: PropTypes.element.isRequired,

  window: PropTypes.func,
};

export default function Banner() {
  const classes = useStyles();
  const { telescopeUrl } = useSiteMetadata();
  const [gitInfo, setGitInfo] = useState('');

  useEffect(() => {
    async function getGitData() {
      try {
        const res = await fetch(`${telescopeUrl}/health`);

        // Fetch failure
        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const data = await res.json();
        setGitInfo(data.info);
      } catch (error) {
        console.error(`Error retrieving site's health info`, error);
      }
    }
    getGitData();
  }, [telescopeUrl]);

  return (
    <>
      <div className={classes.heroBanner}>
        <RetrieveBannerDynamicAssets />

        <Typography variant="h1" className={classes.h1}>
          {'Telescope'}
        </Typography>

        <a
          href={`${gitInfo.gitHubUrl}`}
          title={`git commit ${gitInfo.sha}`}
          className={classes.version}
        >
          v {gitInfo.version}
        </a>
      </div>
      <Grid
        container
        spacing={0}
        direction="row"
        alignItems="center"
        justify="center"
        className={classes.container}
      >
        <Grid item xs={8}>
          <div className={classes.icon}>
            <ScrollDown>
              <Fab color="secondary" aria-label="scroll-down">
                <KeyboardArrowDownIcon fontSize="large" color="textPrimary" />
              </Fab>
            </ScrollDown>
          </div>
        </Grid>
      </Grid>
    </>
  );
}
