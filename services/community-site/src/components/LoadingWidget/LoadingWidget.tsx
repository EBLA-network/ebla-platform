import React from 'react';
import { LoadingWidget as TLoadingWidget } from '@ebla-network/ebla-ui';
import { useLoading } from '../../services/useLoading';

import './loading-widget.scss';

const LoadingWidget = () => {
  const { isLoading } = useLoading();

  return (
    <TLoadingWidget
      isLoading={isLoading}
      widgetId="loadingWidget"
      progressId="loadingWidgetProgress"
    />
  );
};

export default LoadingWidget;
