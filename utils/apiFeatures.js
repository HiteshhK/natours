/**
 * class with input query:Tour.Find()/Tour.create etc and queryString
 * provides methods: filter(),sort(),limitFields,paginate;
 * each methods returns a this, so that we can call all methods by chain
 * for ex: new APIFeatures(Tour.Find(),req,query).filter().sort().paginate()
 */
class APIFeatures{
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        //1.A)FILTERING
        const queryObj = {...this.queryString};
        const excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el=> delete queryObj[el]);//deleting object from query
        
        //1.B)ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr =  queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        this.query = this.query.find(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr));//will return a query
        return this;//return this so that we can chain it with other methods
    }
    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
             this.query = this.query.sort(sortBy);
            // query = query.sort(req.query.sort);
        }
        else{
            this.query = this.query.sort('--createdAt');
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');   
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select('-__v');
        }
        return this;    
    }
    paginate(){
        //page=2&limit=10,1-10 page 1, 11-20 page 2, 21-30 page 3
        // query = query.skip(10).limit(10);
        const page = this.queryString.page *1 || 1;
        const limit = this.queryString.limit *1 || 100;

        const skip = (page - 1)*limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;