var patternMaps = {
            content:/^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
            int:/^[0-9]*$/,
            nfloat:/^[0-9]+(\.)?([0-9]{1,2})?$/,
            tel:/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/,
            phone:/^[0-9]\d{10}$/
};
module.exports=patternMaps;