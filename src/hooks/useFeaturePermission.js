import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook to check if a feature/module is available for the current user
 * @param {string} moduleName - Module name (e.g., 'education', 'pharmacy', 'retail')
 * @returns {Object} - { isAvailable, isLoading, errorMessage }
 */
export const useFeaturePermission = (moduleName) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkFeature = async () => {
      try {
        setIsLoading(true);
        // Try to fetch a simple endpoint for the module
        // If it returns 403, the feature is not available
        let endpoint = '';
        switch (moduleName.toLowerCase()) {
          case 'education':
            endpoint = '/education/classes/';
            break;
          case 'pharmacy':
            endpoint = '/pharmacy/medicines/';
            break;
          case 'retail':
            endpoint = '/retail/products/';
            break;
          case 'hotel':
            endpoint = '/hotel/room-types/';
            break;
          case 'restaurant':
            endpoint = '/restaurant/menu-categories/';
            break;
          case 'salon':
            endpoint = '/salon/service-categories/';
            break;
          default:
            if (isMounted) setIsLoading(false);
            return;
        }

        try {
          await api.get(endpoint, { params: { limit: 1 } });
          if (!isMounted) return;
          setIsAvailable(true);
          setErrorMessage(null);
        } catch (error) {
          if (!isMounted) return;
          if (error.response?.status === 403 && error.isFeaturePermissionError) {
            setIsAvailable(false);
            setErrorMessage(error.featureErrorMessage || 'This feature is not available in your current plan.');
          } else {
            // Other errors (network, etc.) - assume available to avoid blocking
            setIsAvailable(true);
            setErrorMessage(null);
          }
        }
      } catch (error) {
        // Assume available on unexpected errors
        if (isMounted) {
          setIsAvailable(true);
          setErrorMessage(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkFeature();

    // Guards against "set state on an unmounted component" if the route
    // changes while this request is still in flight.
    return () => {
      isMounted = false;
    };
  }, [moduleName]);

  return { isAvailable, isLoading, errorMessage };
};

/**
 * Helper function to extract feature permission error from API error
 * @param {Error} error - API error object
 * @returns {Object|null} - { isFeatureError: boolean, message: string } or null
 */
export const extractFeaturePermissionError = (error) => {
  if (error?.isFeaturePermissionError) {
    return {
      isFeatureError: true,
      message: error.featureErrorMessage || 'This feature is not available in your current plan.'
    };
  }
  
  if (error?.response?.status === 403) {
    const errorDetail = error.response?.data?.detail || error.response?.data?.error || 'Access denied';
    if (errorDetail.includes('module is not available') || errorDetail.includes('plan')) {
      return {
        isFeatureError: true,
        message: errorDetail
      };
    }
  }
  
  return null;
};

