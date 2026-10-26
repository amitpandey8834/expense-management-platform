import { useState } from "react";

const API_URL = "/api/v1";

function App() {
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ name, setName ] = useState("");
  const [ token, setToken ] = useState("");
  const [ expenses, setExpenses ] = useState([]);
  const [ message, setMessage ] = useState("");

  const register = async () => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setToken(data.data.token);
    setMessage("Registered successfully");
  };

  const login = async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setToken(data.data.token);
    setMessage("Logged in successfully");
  };

  const loadExpenses = async () => {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setExpenses(data.data);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Expense Management Platform</h1>

      <h2>Account</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <br />
      <br />

      <button onClick={register}>Register</button>

      <button onClick={login} style={{ marginLeft: "10px" }}>
        Login
      </button>

      <h2>Expenses</h2>

      <button disabled={!token} onClick={loadExpenses}>
        Load Expenses
      </button>

      {message && <p>{message}</p>}

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            {expense.title} — ₹{expense.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;