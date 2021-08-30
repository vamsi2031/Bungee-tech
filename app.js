const fs = require("fs");
const csv = require("csv-parser");
const ObjectsToCsv = require("objects-to-csv");

let csvData = [];
let filteredRows = [];
let priceArray = [];
const inputPath = "./input";
const outputPath = "/output";
let finalCall;

let finalArray = []
fs.createReadStream(inputPath + "/main.csv")
  .pipe(csv())
  .on("data", function (row) {
    const data = {
      sku: row.SKU,
      description: row.DESCRIPTION,
      year: row.YEAR,
      price: row.PRICE,
      sellerInfo: row.SELLER_INFORMATION,
      offerDescription: row.OFFER_DESCRIPTION,
      country: row.COUNTRY,
    };
    csvData.push(data);
  })
  .on("end",async function () {
    for (let data of csvData) {
      if (data.country == "USA(CA)") {
        filteredRows.push(data);
      }
    }
    await  createDir('/output')

    const csv = new ObjectsToCsv(filteredRows);
    csv.toDisk("./output/filteredCountry.csv");
    console.log("'filteredCountry.csv' created !")
  });

const createDir = async (dirpath) => {
  fs.mkdirSync(process.cwd() + dirpath, { recursive: true }, (error) => {
    if (error) {
      console.error("An error occured in create directory: ", error);
    } else {
      console.log("your directory is made !");
    }
  });
};




try {
  if (fs.existsSync("./output/filteredCountry.csv")) {
    fs.createReadStream("./output/filteredCountry.csv")
    .pipe(csv())
    .on("data", function (row) {
      const data = {
        sku: parseInt(row.sku),
        price: parseInt(row.price)
      };
      priceArray.push(data);
    })
    .on("end", function () {
      priceArray.sort(function (a, b) {
        return a.price - b.price;
      }
      )
      priceArray = priceArray.reduce((r, a) => {
        r[a.sku] = [...r[a.sku] || [], a];
        return r;
      }, {});
      for(let data of Object.entries(priceArray)){
        let obj = {}
        if(data[0]){
          obj.SKU = data[0]
        }else{
          obj.SKU = ""
        }
        if(data[1][0]){
          obj.FIRST_MINIMUM_ORDER = data[1][0].price
        }else{
          obj.FIRST_MINIMUM_ORDER = ""
        }
        if(data[1][1]){
          obj.SECOND_MINIMUM_ORDER = data[1][1].price
        }else{
          obj.SECOND_MINIMUM_ORDER = ""
        }

        finalArray.push(obj)
      }
      const csv = new ObjectsToCsv(finalArray);
      csv.toDisk("./output/lowestPrice.csv");
      console.log("'lowestPrice.csv' created !")

    })
  } else {
    console.log(" 'filteredCountry.csv' File does not exist.");
  }
} catch (err) {
  console.error(err);
}
