const mongoose = require("mongoose");
const passportlocalmongoose = require("passport-local-mongoose");

UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    amount:Number,
    bill:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Bill"
        }
    ]
});

UserSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("User",UserSchema);