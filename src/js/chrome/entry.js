import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { globalFilterScope, toggleGlobalFilter } from '../redux/actions';
import { spinUpStore } from '../redux-config';
import * as actionTypes from '../redux/action-types';
import loadInventory from '../inventory/index';
import loadRemediations from '../remediations';
import qe from './iqeEnablement';
import consts from '../consts';
import RootApp from '../App/RootApp';
import debugFunctions from '../debugFunctions';
import { visibilityFunctions } from '../consts';
import Cookies from 'js-cookie';
import { getUrl } from '../utils';
import { createSupportCase } from '../createCase';
import sourceOfTruth from '../nav/sourceOfTruth';
import { flatTags } from '../App/GlobalFilter/constants';
import { safeLoad } from 'js-yaml';

export function chromeInit() {
  const { store, actions } = spinUpStore();

  // public API actions
  const { appAction, appObjectId } = actions;

  return {
    identifyApp: () => {},
    navigation: () => console.error("Don't use insights.chrome.navigation, it has been deprecated!"),
    appAction,
    appObjectId,
    hideGlobalFilter: (isHidden) => store.dispatch(toggleGlobalFilter(isHidden)),
    globalFilterScope: (scope) => store.dispatch(globalFilterScope(scope)),
    mapGlobalFilter: flatTags,
    appNavClick: () => {},
    on: () => {},
  };
}

export function bootstrap(libjwt, initFunc, getUser) {
  return {
    chrome: {
      auth: {
        getOfflineToken: () => libjwt.getOfflineToken(),
        doOffline: () => libjwt.jwt.doOffline(consts.noAuthParam, consts.offlineToken),
        getToken: () => libjwt.jwt.getUserInfo().then(() => libjwt.jwt.getEncodedToken()),
        getUser,
        qe: qe,
        logout: (bounce) => libjwt.jwt.logoutAllTabs(bounce),
        login: () => libjwt.jwt.login(),
      },
      isProd: window.location.host === 'cloud.redhat.com',
      isBeta: () => (window.location.pathname.split('/')[1] === 'beta' ? true : false),
      isPenTest: () => (Cookies.get('x-rh-insights-pentest') ? true : false),
      getBundle: () => getUrl('bundle'),
      getApp: () => getUrl('app'),
      getEnvironment: () => getEnv(),
      createCase: (fields) => insights.chrome.auth.getUser().then((user) => createSupportCase(user.identity, fields)),
      visibilityFunctions,
      init: initFunc,
    },
    loadInventory,
    experimental: {
      loadRemediations,
    },
  };
}

const App = () => {
  return <RootApp />;
};

export function rootApp() {
  const { store } = spinUpStore();
  const pageRoot = document.querySelector('.pf-c-page__drawer');
  if (pageRoot) {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      pageRoot
    );
  }
}
