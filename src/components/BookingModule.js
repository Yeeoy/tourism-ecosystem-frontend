import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { post } from "../utils/api";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import {
    CalendarIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/solid";

const BookingModule = ({ hotelId, roomTypes, isLoggedIn }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [selectedRoomType, setSelectedRoomType] = useState("");
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [pricePerNight, setPricePerNight] = useState(0);
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setCheckInDate(today.toISOString().split("T")[0]);
        setCheckOutDate(tomorrow.toISOString().split("T")[0]);

        if (Object.keys(roomTypes).length > 0) {
            const firstRoomTypeId = Object.keys(roomTypes)[0];
            setSelectedRoomType(firstRoomTypeId);
            setPricePerNight(roomTypes[firstRoomTypeId].price_per_night);
        }
    }, [roomTypes]);

    useEffect(() => {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setNumberOfNights(nights);
        setTotalPrice(pricePerNight * nights * numberOfRooms);
    }, [checkInDate, checkOutDate, pricePerNight, numberOfRooms]);

    const handleRoomTypeChange = (e) => {
        const selectedId = e.target.value;
        setSelectedRoomType(selectedId);
        setPricePerNight(roomTypes[selectedId].price_per_night);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showToast.error(t("pleaseLoginToBook"));
            return;
        }
        try {
            const userId = localStorage.getItem("user_id");
            const response = await post("/api/accommodation/room-booking/", {
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                booking_status: true,
                payment_status: false,
                room_type_id: parseInt(selectedRoomType),
                accommodation_id: parseInt(hotelId),
                user_id: parseInt(userId),
                number_of_rooms: numberOfRooms,
            });
            if (response.code === 201) {
                showToast.success(t("bookingSuccessful"));
            } else {
                throw new Error(response.msg || t("bookingFailed"));
            }
        } catch (err) {
            showToast.error(err.message || t("bookingFailed"));
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {t("bookNow")}
                </h2>
                <form onSubmit={handleBooking}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="checkInDate">
                                <CalendarIcon className="h-5 w-5 inline-block mr-1 text-blue-500" />
                                {t("checkInDate")}
                            </label>
                            <input
                                type="date"
                                id="checkInDate"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="checkOutDate">
                                <CalendarIcon className="h-5 w-5 inline-block mr-1 text-blue-500" />
                                {t("checkOutDate")}
                            </label>
                            <input
                                type="date"
                                id="checkOutDate"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={checkOutDate}
                                onChange={(e) =>
                                    setCheckOutDate(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="roomType">
                            <UserGroupIcon className="h-5 w-5 inline-block mr-1 text-blue-500" />
                            {t("roomType")}
                        </label>
                        <select
                            id="roomType"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={selectedRoomType}
                            onChange={handleRoomTypeChange}
                            required>
                            <option value="">{t("selectRoomType")}</option>
                            {Object.entries(roomTypes).map(([id, type]) => (
                                <option key={id} value={id}>
                                    {type.room_type} - ${type.price_per_night}/
                                    {t("night")}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="numberOfRooms">
                            <UserGroupIcon className="h-5 w-5 inline-block mr-1 text-blue-500" />
                            {t("numberOfRooms")}
                        </label>
                        <input
                            type="number"
                            id="numberOfRooms"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={numberOfRooms}
                            onChange={(e) =>
                                setNumberOfRooms(parseInt(e.target.value))
                            }
                            min="1"
                            required
                        />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 font-semibold">
                                {t("pricePerNight")}:
                            </span>
                            <span className="text-blue-600 font-bold">
                                ${pricePerNight}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 font-semibold">
                                {t("numberOfNights")}:
                            </span>
                            <span className="text-blue-600 font-bold">
                                {numberOfNights}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 font-semibold">
                                {t("numberOfRooms")}:
                            </span>
                            <span className="text-blue-600 font-bold">
                                {numberOfRooms}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">
                                    {t("totalPrice")}:
                                </span>
                                <span className="text-2xl font-bold text-blue-600">
                                    <CurrencyDollarIcon className="h-8 w-8 inline-block mr-1" />
                                    ${totalPrice}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out transform hover:scale-105">
                        {t("bookNow")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingModule;
