
const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    color: { type: String, required: true },
    colorImage: { type: String, required: true },
    mainImage: { type: String, required: true },
    subImages: {
      type: [String],
      required: true,
    },
    videos: [
      {
        url: { type: String, required: true },
        thumbnail: { type: String }, // Optional thumbnail
      }
    ],
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SizeVariant' }],
  },
  { timestamps: true }
);


const Variant = mongoose.model('Variant', VariantSchema);
module.exports = Variant;
