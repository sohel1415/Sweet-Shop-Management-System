import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc');
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [sweets, setSweets] = useState([]);

  // Fetch sweets data when component mounts
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/sweets");
        if (!response.ok) throw new Error('Failed to fetch sweets');
        const data = await response.json();
        setSweets(data.data);
      } catch (err) {
        console.error('Error fetching sweets:', err);
      }
    };
    fetchSweets();
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      // Check available quantity
      const availableQuantity = item.quantity;
      const cartItem = prevCart.find((i) => i.productId === item.productId);
      const currentInCart = cartItem ? cartItem.quantity : 0;
      
      // If trying to add more than available
      if (currentInCart >= availableQuantity) {
        alert(`Cannot add more. Only ${availableQuantity} available.`);
        return prevCart;
      }

      // Update cart
      if (cartItem) {
        return prevCart.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate available quantity for each sweet
  const getAvailableQuantity = (productId) => {
    const sweet = sweets.find(s => s.productId === productId);
    if (!sweet) return 0;
    
    const cartItem = cart.find(i => i.productId === productId);
    const inCart = cartItem ? cartItem.quantity : 0;
    
    return sweet.quantity - inCart;
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Sweet Shop Management</h1>
        </div>
        <div className="navbar">
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('add')}>Add Sweet</button>
          <button onClick={() => setPage('manage')}>Manage Sweets</button>
        </div>
        <div className="content">
          {page === 'home' && (
            <div className="home-page">
              <div className="shop-section">
                <Buy
                  search={search}
                  setSearch={setSearch}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />
                <FetchApi
                  search={search}
                  typeFilter={typeFilter}
                  sortOrder={sortOrder}
                  addToCart={addToCart}
                  sweets={sweets}
                  cart={cart}
                  getAvailableQuantity={getAvailableQuantity}
                />
              </div>
              <div className="cart-section">
                <CartBox
                  cart={cart}
                  removeFromCart={removeFromCart}
                  decreaseQuantity={decreaseQuantity}
                  setCart={setCart}
                />
              </div>
            </div>
          )}
          {page === 'add' && <AddSweet setSweets={setSweets} />}
          {page === 'manage' && <SweetManager setSweets={setSweets} />}
        </div>
      </div>
    </div>
  );
}

function FetchApi({ search, typeFilter, sortOrder, addToCart, sweets, cart, getAvailableQuantity }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredData = sweets
    .filter((item) => 
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item) =>
      typeFilter ? item.type.toLowerCase() === typeFilter.toLowerCase() : true
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'id-asc': return a.productId - b.productId;
        case 'id-desc': return b.productId - a.productId;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

  if (loading && sweets.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="sweet-list">
      {filteredData.length === 0 ? (
        <p>No sweets found matching your criteria.</p>
      ) : (
        <table className="sweet-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const available = getAvailableQuantity(item.productId);
              return (
                <tr key={item.productId}>
                  <td>{item.productId}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>₹{item.price}</td>
                  <td>{available}</td>
                  <td>
                    <button 
                      onClick={() => addToCart(item)}
                      disabled={available <= 0}
                    >
                      {available <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}


function Buy({ search, setSearch, typeFilter, setTypeFilter, sortOrder, setSortOrder }) {
  return (
    <form className="buy-form">
      <div className="form-group">
        <label>Type:</label>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All</option>
          <option value="chocolate">Chocolate</option>
          <option value="candy">Candy</option>
          <option value="cake">Cake</option>
          <option value="pastry">Pastry</option>
        </select>
      </div>
      <div className="form-group">
        <label>Search:</label>
        <input
          type="text"
          placeholder="Search Sweet"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Sort:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="id-asc">ID (Low to High)</option>
          <option value="id-desc">ID (High to Low)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>
    </form>
  );
}

function CartBox({ cart, removeFromCart, decreaseQuantity, setCart }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsCheckingOut(true);
    setCheckoutMessage(null);

    try {
      const response = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();
      setCheckoutMessage({ type: 'success', text: 'Checkout successful!' });
      setCart([]); // Clear the cart after successful checkout
    } catch (error) {
      setCheckoutMessage({ type: 'error', text: error.message });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-box">
      <h3>🛒 Your Cart</h3>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className="cart-items">
            {cart.map((item) => (
              <li key={item.productId}>
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>₹{item.price} × {item.quantity}</span>
                  <span className="item-total">₹{item.price * item.quantity}</span>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => decreaseQuantity(item.productId)}>-</button>
                  <button onClick={() => removeFromCart(item.productId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <h4>Total: ₹{total}</h4>
            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            {checkoutMessage && (
              <div className={`checkout-message ${checkoutMessage.type}`}>
                {checkoutMessage.text}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AddSweet() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'chocolate',
    price: '',
    quantity: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/sweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          quantity: parseInt(formData.quantity)
        })
      });
      
      if (!response.ok) throw new Error('Failed to add sweet');
      
      const data = await response.json();
      setMessage(`Successfully added ${data.name}!`);
      setFormData({
        name: '',
        type: 'chocolate',
        price: '',
        quantity: ''
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Sweet</h2>
      {message && <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="chocolate">Chocolate</option>
            <option value="candy">Candy</option>
            <option value="cake">Cake</option>
            <option value="pastry">Pastry</option>
          </select>
        </div>
        <div className="form-group">
          <label>Price (₹):</label>
          <input
            type="number"
            name="price"
            min="1"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Sweet'}
        </button>
      </form>
    </div>
  );
}

function SweetManager() {
  const [sweets, setSweets] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedSweet, setEditedSweet] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/sweets");
        if (!response.ok) throw new Error('Failed to fetch sweets');
        const data = await response.json();
        setSweets(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSweets();
  }, []);

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sweets/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setSweets(sweets.filter((s) => s.productId !== productId));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditClick = (sweet) => {
    setEditId(sweet.productId);
    setEditedSweet({ ...sweet });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedSweet((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sweets/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedSweet,
          price: parseInt(editedSweet.price),
          quantity: parseInt(editedSweet.quantity)
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      
      const updatedSweet = await response.json();
      setSweets(sweets.map((s) => s.productId === editId ? updatedSweet : s));
      setEditId(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="manager-container">
      <h2>Manage Sweets</h2>
      <div className="sweet-table-container">
        <table className="sweet-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price (₹)</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map((sweet) => (
              <tr key={sweet.productId}>
                <td>{sweet.productId}</td>
                <td>
                  {editId === sweet.productId ? (
                    <input 
                      name="name" 
                      value={editedSweet.name} 
                      onChange={handleEditChange} 
                    />
                  ) : sweet.name}
                </td>
                <td>
                  {editId === sweet.productId ? (
                    <select 
                      name="type" 
                      value={editedSweet.type} 
                      onChange={handleEditChange}
                    >
                      <option value="chocolate">Chocolate</option>
                      <option value="candy">Candy</option>
                      <option value="cake">Cake</option>
                      <option value="pastry">Pastry</option>
                    </select>
                  ) : sweet.type}
                </td>
                <td>
                  {editId === sweet.productId ? (
                    <input 
                      name="price" 
                      type="number" 
                      min="1"
                      value={editedSweet.price} 
                      onChange={handleEditChange} 
                    />
                  ) : `₹${sweet.price}`}
                </td>
                <td>
                  {editId === sweet.productId ? (
                    <input 
                      name="quantity" 
                      type="number" 
                      min="0"
                      value={editedSweet.quantity} 
                      onChange={handleEditChange} 
                    />
                  ) : sweet.quantity}
                </td>
                <td>
                  {editId === sweet.productId ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <button onClick={() => setEditId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(sweet)}>Edit</button>
                      <button 
                        onClick={() => handleDelete(sweet.productId)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;