import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Product } from './types';

// API URL
const API_URL = 'http://localhost:8000/api/products/';

// Fetch all products
const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get<Product[]>(API_URL);
  return response.data;
};

// Create a new product
const createProduct = async (product: Product): Promise<Product> => {
  const response = await axios.post<Product>(API_URL, product, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Update an existing product
const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await axios.put<Product>(`${API_URL}${id}/`, product, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Delete a product
const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};

// Main App component with routing
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/create" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
      </Routes>
    </Router>
  );
};

// Component to list all products
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/create');
  };

  return (
    <div>
      <h1>Product List</h1>
      <button onClick={handleCreate}>Create New Product</button>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.desc} - ${parseFloat(product.price.toString()).toFixed(2)}
            <button onClick={() => handleEdit(product.id!)}>Edit</button>
            <button onClick={() => handleDelete(product.id!)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Component to handle product form (create/update)
const ProductForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product>({ desc: '', price: 1 });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get<Product>(`${API_URL}${id}/`);
          setProduct(response.data);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateProduct(parseInt(id), product);
      } else {
        await createProduct(product);
      }
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Product' : 'Create Product'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="desc"
            // value={product.desc}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{id ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
};

export default App;
