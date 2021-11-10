import React from 'react'
import { TagIcon } from '@sanity/icons'

const ImagePreview = (props: { url: string }) => {
  const { url } = props
  if (!url) {
    return null
  }

  return <img src={`${url}&width=400`} />
}

export default {
  name: 'blockProduct',
  title: 'Image',
  type: 'object',
  icon: TagIcon,
  fields: [
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      weak: true,
      to: [{ type: 'product' }]
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string'
    }
  ],
  preview: {
    select: {
      productImageUrl: 'product.store.previewImageUrl',
      productTitle: 'product.store.title'
    },
    prepare(selection) {
      const { productImageUrl, productTitle } = selection

      return {
        media: <ImagePreview url={productImageUrl} />,
        title: productTitle
      }
    }
  }
}
