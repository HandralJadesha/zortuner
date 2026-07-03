import ClientPage from './ClientPage.jsx';
import productsData from '../../../data/products.json';

export function generateStaticParams() {
  return productsData.map((product) => ({
    key: product.slug,
  }));
}

export default function Page() {
  return <ClientPage />;
}
