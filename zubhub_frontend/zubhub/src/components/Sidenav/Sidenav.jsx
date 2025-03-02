import {
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import API from '../../api';
import { images } from '../../assets/images';
import { logout } from '../../store/actions/authActions';
import { bottomLinks, links } from './data';
import { sidenavStyle } from './sidenav.styles';

export default function Sidenav() {
  const classes = makeStyles(sidenavStyle)();
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const history = useHistory();
  const auth = useSelector(state => state.auth);
  const [isLogginOut, setIsLogginOut] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [myProjectCount, setMyProjectCount] = useState(0);

  useEffect(() => {
    const api = new API();
    const request1 = api.getUserDrafts({ username: auth?.username, token: auth?.token });
    const request2 = api.getUserProjects({ username: auth?.username, token: auth?.token });
    let res = Promise.all([request1, request2]);
    res.then(data => {
      setDraftCount(data[0].count);
      setMyProjectCount(data[1].count);
    });
  }, []);

  const handleLogout = async () => {
    setIsLogginOut(true);
    const res = await dispatch(logout({ token: auth.token, history, t }));
  };

  const displayLink = requireAuth => {
    if (requireAuth && !auth?.token) return false;
    return true;
  };

  return (
    <div className={classes.container}>
      <List className={classes.listContainer}>
        {isSmallScreen && (
          <Link className={clsx(classes.logo, classes.link)} href="/">
            <ListItem>
              <img alt="Zubhub Logo" src={images.logo} />
            </ListItem>
          </Link>
        )}

        {links({ draftCount, myProjectCount, auth, t }).map(
          ({ label, link, icon: Icon, red, requireAuth, target }, index) =>
            displayLink(requireAuth) && (
              <Link
                key={index + label}
                className={clsx(classes.label, classes.link, pathname == link && classes.active, red && classes.red)}
                href={link}
                target={target || '_self'}
              >
                <ListItem key={label}>
                  <ListItemIcon>
                    <Icon size={22} />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              </Link>
            ),
        )}

        {bottomLinks({ t }).map(
          ({ label, link, icon: Icon, red, action, requireAuth }, index) =>
            displayLink(requireAuth) && (
              <Link
                key={index + label}
                className={clsx(classes.label, classes.link, pathname == link && classes.active, red && classes.red)}
                style={{ marginTop: index == 0 && 'auto' }}
                {...(link && { href: link })}
                onClick={action == 'logout' ? handleLogout : null}
              >
                <ListItem key={label}>
                  <ListItemIcon>
                    {action === 'logout' && isLogginOut ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      <Icon size={22} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              </Link>
            ),
        )}
      </List>
    </div>
  );
}
