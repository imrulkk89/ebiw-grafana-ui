import { css } from '@emotion/css';
import { Table, useTheme2 } from "@grafana/ui";
import {
  applyFieldOverrides,
  FieldType,
  MutableDataFrame,
  ThresholdsMode
} from '@grafana/data';
//import { products } from "./products";
import './normalize.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const defaultThresholds = {
  steps: [
    {
      color: 'blue',
      value: 0,
    },
    {
      color: 'green',
      value: 2.5,
    },
  ],
  mode: ThresholdsMode.Absolute,
};

const prepData = (data, theme) => {
  return applyFieldOverrides({
    data: data,
    fieldConfig: {
      overrides: [],
      defaults: {},
    },
    theme,
    replaceVariables: (value) => value,
  });
}

const buildData = (theme, products) => {
  const data = new MutableDataFrame({
    fields: [
      { name: "Title", type: FieldType.string, values: [] },
      { 
        name: "Description", 
        type: FieldType.string, 
        values: [], 
        config: {
          custom: {
            align: "center",
            width: 300
          }
        }
      },
      {
        name: "Price",
        type: FieldType.number,
        values: [],
        config: {
          unit: "currencyUSD",
          decimals: 0,
          custom: {
            align: "center",
            width: 80
          }
        }
      },
      {
        name: "Discount",
        type: FieldType.number,
        values: [],
        config: {
          unit: "percent",
          decimals: 2,
          custom: {
            align: "center",
            width: 80
          }
        }
      },
      { 
        name: "Brand", 
        type: FieldType.string, 
        values: [],
        custom: {
          align: "center",
          width: 80
        }
      },
      { name: "Category", type: FieldType.string, values: [] },
      {
        name: "Stock",
        type: FieldType.number,
        values: [],
        config: {
          decimals: 0,
          custom: {
            align: "center",
            width: 80
          }
        }
      },
      {
        name: "Rating",
        type: FieldType.number,
        values: [],
        config: {
          decimals: 2,
          min: 0,
          max: 5,
          custom: {
            width: 100,
            displayMode: 'gradient-gauge',
          },
          thresholds: defaultThresholds,
        }
      }
    ]
  });

  products.forEach((product) => {
    data.appendRow([
      product.title,
      product.description,
      product.price,
      product.discountPercentage,
      product.brand,
      product.category,
      product.stock,
      product.rating
    ]);
  });

  return prepData([data], theme);
}

export default function App() {

  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length === 0) {
      axios.get('https://dummyjson.com/products')
        .then(response => {
          setProducts(response.data.products);
          setLoading(false);
        })
        .catch(error => {
          console.log('Error fetching data: ', error);
          setLoading(true);
        });
    }
  }, [products]);

  const theme = useTheme2();

  useEffect(() => {
    if (products.length > 0) {
      setData(buildData(theme, products));
    }
  }, [products, theme]);
  
  const style = css`
    width: 100%;
    height: 100%;
    padding: 32px;
    background: ${theme.colors.background.canvas};
    color: white;
  `;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={style}>
      {data.length ? <Table data={data[0]} height={800} width={1500} columnMinWidth={200} resizable={true}/> : ''}
    </div>
  );
}
