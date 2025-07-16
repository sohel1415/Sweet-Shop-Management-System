import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Sweet Shop Management</h1>
        </div>
        <div className="navbar">
          <a href="#" >Home</a>
          <a href="#" >Add Sweet</a>
          <a href="#" >All Sweet</a>
        </div>
        <div className="content">
          <AddSweet />
        </div>
      </div>
    </div>
  );
}

function AddSweet() {
  return (
    <div className="purchase-form">
      <h3>Add Sweets</h3>
      <form>
        <label for="sweetType">Sweet Type:</label>
        <select id="sweetType" name="sweetType" required>
          <option value="">--Select Sweet Type--</option>
          <option value="chocolate">Chocolate</option>
          <option value="candy">Candy</option>
          <option value="cake">Cake</option>
          <option value="pastry">Pastry</option>
        </select>
        <label for="sweetName">Sweet Name:</label>
        <input type="text" id="sweetName" name="sweetName" required />
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" name="quantity" min="1" required />
        <button type="submit">Add Sweet</button>
      </form>

    </div>
  );
}

export default App;
