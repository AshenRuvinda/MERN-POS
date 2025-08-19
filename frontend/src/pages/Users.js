import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getUsers, register, updateUser } from '../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier', isActive: true });

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUsers();
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(form);
      setForm({ username: '', password: '', role: 'cashier', isActive: true });
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id, user) => {
    try {
      await updateUser(id, user);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Users</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="admin">Admin</option>
          <option value="cashier">Cashier</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </form>
      <Table
        headers={['Username', 'Role', 'Status', 'Actions']}
        data={users}
        renderRow={user => (
          <tr key={user._id}>
            <td className="border p-2">{user.username}</td>
            <td className="border p-2">{user.role}</td>
            <td className="border p-2">{user.isActive ? 'Active' : 'Inactive'}</td>
            <td className="border p-2">
              <button
                onClick={() => handleUpdate(user._id, { ...user, isActive: !user.isActive })}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Toggle Status
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default Users;