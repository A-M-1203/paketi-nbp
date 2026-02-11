const mongoose=require('mongoose');
const validator=require('validator');

const shipmentSchema=new mongoose.Schema({
    sender: {
        userId:{
            required: [true, "Sender is required"],
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: {
            type: String,
            required: [true, "Sender name is required"],
            trim: true
          },
          email: {
            type: String,
            required: [true, "Sender email is required"],
            trim: true,
            lowercase: true,
            validate: {
              validator: (v) => validator.isEmail(v),
              message: "Please provide a valid email address"
            }
          }
    },
    recipient: {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            minlength: [6, "Email must be at least 6 characters"],
            maxlength: [254, "Email must be at most 254 characters"],
            validate: {
                validator: function (v) {
                    return validator.isEmail(v);
                },
                message: 'Please provide a valid email address'
            }
        },
        name: {
            type:String,
            required:[true, "Name is required"],
            maxlength: [100, "Name must be at most 100 characters"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z\s]+$/.test(v);
                },
                message: 'Name must contain only letters and spaces'
            }
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            minlength: [8, "Phone number must be at least 8 characters"],
            maxlength: [15, "Phone number must be at most 15 characters"],
            validate: {
                validator: function (v) {
                    return /^\d+$/.test(v);
                },
            }
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            maxlength: [100, "Address must be at most 100 characters"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s]+$/.test(v);
                },
                message: 'Address must contain only letters, numbers and spaces'
            }
        },
        city: {
            type: String,
            required: [true, "City is required"],
            maxlength: [50, "City must be at most 50 characters"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s]+$/.test(v);
                },
                message: 'City must contain only letters, numbers and spaces'
            }
        },
        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            minlength: [3, "Postal code must be at least 3 characters"],
            maxlength: [10, "Postal code must be at most 10 characters"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s\-]+$/.test(v);
                },
                message: 'Postal code must contain only letters, numbers, spaces and hyphen'
            }
        }
    },
    courier:{
        courierId: {
            type: mongoose.Schema.ObjectId,
            ref: "Courier",
            required: [true, "Courier is required"]
        },
        name: {
            type: String,
            required: [true, "Courier name is required"],
            trim: true
          }
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: [1, "Weight must be at least 1"],
        max: [1000000, "Weight must be at most 1000000"],
        unit: {
            type: String,
            required: [true, "Unit is required"],
            enum: {
                values: ['kg', 'g', 'mg', 'lb', 'oz'],
                message: 'Unit must be one of: kg, g, mg, lb, oz'
            },
        }
    },
    statuses: [{
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: {
                values: ['Picked up', 'In transit', 'Delivered', 'Delivery failed', 'In warehouse'],
                message: 'Status must be one of: Picked up, In transit, Delivered, Delivery failed, In warehouse'
            },
            trim: true
        },
        dateTime: {
            type: Date,
            default: Date.now()
        }
    }],
    confirmToken: String,
    confirmUsed: Boolean,
    branchId:{
        type:mongoose.Schema.ObjectId,
        ref: "Branch"
    }
});

module.exports = mongoose.model("Shipment", shipmentSchema);

