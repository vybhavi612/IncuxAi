const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({

userEmail : {

    type : String,

    required : true

},

login : {

    type : Date,

    required : true

},

logout : {

    type : Date,

    default : null

}

});

module.exports =
mongoose.model(
"History",
historySchema
);