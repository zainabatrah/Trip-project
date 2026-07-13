const createPayment = async ({
    amount,
    userId,
    tripId,
    travelers
}) => {

    return {

        success: true,

        paymentId: "TEST_PAYMENT_" + Date.now(),

        amount,

        userId,

        tripId,

        travelers,

        status: "paid"

    };

};

module.exports = {
    createPayment
};