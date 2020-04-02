

const getMaterial = (material) => {
    return {
        sku: productDesc.NumeroMaterial.replace(/^0+/, ''),
        stock: parseFloat(productDesc.stock),
        price: strPriceWSToFloat(productDesc.PrecioNeto),
        price_discount: strPriceWSToFloat(productDesc.PrecioNetoMasIva),
        sale_unit: productDesc.UnidadDeMedida,
        currency: 'CLP'
    }
}

module.exports = { getMaterial }