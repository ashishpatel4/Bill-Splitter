const mongoose = require("mongoose");

BillSchema = new mongoose.Schema({
    name:String,
    payer:String,
    total:Number,
    people:[String],
    amount:Number
});

module.exports = mongoose.model("Bill",BillSchema);