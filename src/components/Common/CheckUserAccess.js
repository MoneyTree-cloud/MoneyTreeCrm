import ApiClient from '../../helpers/api_helper';
import { CHECK_USER_PERMISSION } from '../../helpers/url_helper';

const CheckUserAccess = async (userId, routeName) => {
  try {
    const response = await ApiClient.get(CHECK_USER_PERMISSION, {
      params: {
        userId: userId,
        menu: routeName,
      },
    });

    if (response?.data?.status === 1) {
      return response.data.data;
    } else {
      return false;
    }
  } catch (error) {
    console.error('CheckUserAccess error:', error);
    return false;
  }
};

export default CheckUserAccess;
