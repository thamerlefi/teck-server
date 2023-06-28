const { newError } = require("./Errors");

exports.paginatedResults = (model) => async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  let sortBy = req.query.sortBy;
  let filter = req.query.filter;
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  const minRating = Number(req.query.minRating);
  const categories = req.query.categories;
  let search = req.query.search;
  let filterObject = {};
  if (filter) {
    const [key, value] = filter.split(",");
    filterObject = { [key]: value };
  }
  if (minPrice >= 0 && maxPrice) {
    filterObject.price = { $gte: minPrice, $lte: maxPrice };
  }
  if (minRating >= 0) {
    filterObject.rating = { $gte: minRating };
  }
  if (search) {
    search = search.split("+").join(" ");
    const regex = new RegExp(search, "i");
    filterObject.$or = [
      { name: { $regex: regex } },
      // { description: { $regex: regex } },
      { category: { $regex: regex } },
    ];
  }
  if (categories){
    filterObject.category = { $in: categories.split(',') }
  }

  // if (sortBy){ 
  sortBy = sortBy.split(","); //
  sortBy[1] = sortBy[1] === "desc" ? 1 : -1; // convert "sortBy=rating,desc" to => {rating: 1}
  const obj = {}; //
  obj[sortBy[0]] = sortBy[1]; //
// } else obj= {"createdAt":1}
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = {};

  if (endIndex < (await model.countDocuments(filterObject).exec())) {
    result.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    result.previous = {
      page: page - 1,
      limit,
    };
  }

  try {
    result.list = await model
      .find(filterObject)
      .sort(obj)
      .limit(limit)
      .skip(startIndex);
    const total =   await model.countDocuments(filterObject).exec()
    const pages = total/ limit
    result.total= total
    result.pages = Math.ceil(pages);
    res.pagination = result;
    next();
  } catch (error) {
    return next(newError(500, error.message));
  }
};
