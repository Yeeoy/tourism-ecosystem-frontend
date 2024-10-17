import React, { useState, useEffect } from 'react';
import { get, patch, del } from '../utils/api';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, MapPinIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const TourOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tours, setTours] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await get('/api/information-center/tour-bookings/');
            if (response.code === 200 && response.data) {
                setOrders(response.data);
                fetchTours(response.data);
            } else {
                throw new Error(response.msg || t('failedToGetOrders'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToGetOrders'));
        } finally {
            setLoading(false);
        }
    };

    const fetchTours = async (orders) => {
        const uniqueTourIds = [...new Set(orders.map(order => order.tour_id))];
        const tourPromises = uniqueTourIds.map(async (id) => {
            try {
                const response = await get(`/api/information-center/tours/${id}/`);
                if (response.code === 200 && response.data) {
                    return { [id]: response.data };
                }
            } catch (err) {
                console.error(t('failedToGetTour', { id }), err);
            }
            return null;
        });

        const tourResults = await Promise.all(tourPromises);
        const newTours = Object.assign({}, ...tourResults.filter(Boolean));
        setTours(newTours);
    };

    const cancelOrder = async (orderId) => {
        try {
            const response = await patch(`/api/information-center/tour-bookings/${orderId}/`, {
                booking_status: false,
                payment_status: false
            });
            if (response.code === 200 && response.data) {
                setOrders(orders.map(order => 
                    order.id === orderId 
                        ? { ...order, booking_status: false, payment_status: false } 
                        : order
                ));
                showToast.success(t('orderCancelledSuccessfully'));
            } else {
                throw new Error(response.msg || t('failedToCancelOrder'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToCancelOrder'));
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            await del(`/api/information-center/tour-bookings/${orderId}/`);
            setOrders(orders.filter(order => order.id !== orderId));
            showToast.success(t('orderDeletedSuccessfully'));
        } catch (err) {
            console.error(t('errorDeletingOrder'), err);
            if (err.message === 'Network Error') {
                showToast.error(t('networkError'));
            } else {
                showToast.error(t('failedToDeleteOrder'));
            }
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleGoBack}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300 mr-4"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">{t('myTourOrders')}</h1>
            </div>
            {orders.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tourName')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('price')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className={!order.booking_status ? 'bg-gray-100' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{tours[order.tour_id]?.name || t('loading')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                                            {order.total_price}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.booking_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {order.booking_status ? t('confirmed') : t('cancelled')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {order.booking_status ? (
                                            <button 
                                                onClick={() => cancelOrder(order.id)} 
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {t('cancelOrder')}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => deleteOrder(order.id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md">
                    <p className="text-xl mb-4">{t('noTourOrders')}</p>
                    <a href="/tours" className="text-blue-500 hover:text-blue-700 transition duration-300">
                        {t('bookTourNow')} →
                    </a>
                </div>
            )}
        </div>
    );
};

export default TourOrders;
