const express =require("express");
const  {createPayment} = require("../services/paymentService.js");


const router = express.Router();


router.post("/", async (req, res) => {

    try {

        const {
            tripId,
            travelers,
            amount
        } = req.body;


        // Basic validation

        if (!tripId) {
            return res.status(400).json({
                message: "Trip ID is required"
            });
        }


        if (!travelers || travelers < 1) {
            return res.status(400).json({
                message: "Invalid number of travelers"
            });
        }


        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Invalid amount"
            });
        }


        const result = await createPayment({
            tripId,
            travelers,
            amount
        });


        res.json(result);


    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});


module.exports = router;