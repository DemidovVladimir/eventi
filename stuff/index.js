var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/uncojet');

var mongoose = require('mongoose');

var equipment = mongoose.Schema({
    equipment_name:{
        type:String,
        unique:true
    },
    equipment_photo:{
        type:[],
        unique:false
    },
    equipment_about:{
        type:String
    },
    equipment_some:{
        type:String,
        unique:false
    },
    equipment_spec:{
        type:[],
        unique:false
    },
    equipment_price:{
        type:String,
        unique:false
    },
    equipment_benefits:{
        type:String,
        unique:false
    },
    equipment_areas:{
        type:[],
        unique:false
    },
    equipment_documents:{
        type:[],
        unique:false
    },
    equipment_videos:{
        type:[],
        unique:false
    },
    equipment_category:{
        type:String,
        unique:false
    },
    equipment_order:{
        type:String
    },
    equipment_popular:{
        type:String
    }
});
exports.equipmentModel = mongoose.model('equipment',equipment);


var categories = mongoose.Schema({
    cat_title:{
        type:String,
        unique:true
    },
    cat_photos:{
        type:[],
        unique:false
    },
    cat_about:{
        type:String
    },
    cat_areas:{
        type:[],
        unique:false
    },
    cat_documents:{
        type:[],
        unique:false
    },
    cat_videos:{
        type:[],
        unique:false
    },
    cat_order:{
        type:Number
    }
});
exports.categoryModel = mongoose.model('categories',categories);


var areas = mongoose.Schema({
    area_title:{
        type:String,
        unique:true
    },
    area_about:{
        type:String,
        unique:false
    },
    area_photos:{
        type:[],
        unique:false
    },
    area_videos:{
        type:[],
        unique:false
    },
    area_equipment:{
        type:[],
        unique:false
    }
});
exports.areaModel = mongoose.model('area',areas);
