import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

import {
  Authenticator,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from '@aws-amplify/ui-react'
import { MdDelete } from 'react-icons/md'
import '@aws-amplify/ui-react/styles.css'

import awsExports from "./aws-exports"
Amplify.configure(awsExports)

const initialState = {
  name: '',
  description: '',
}

const App = () => {
  const [formData, setFormData] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  const setInput = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const fetchTodos = async () => {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items

      setTodos(todos)
    } catch (err) {
      console.log('error fetching todos')
    }
  }

  const addTodo = async () => {
    try {
      if (!formData.name || !formData.description) return

      const todo = { ...formData }

      setFormData(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))
      await fetchTodos()
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  const removeTodo = async (todo) => {
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id: todo.id } }))
      await fetchTodos()
    } catch (err) {
      console.log('error removing todo:', err)
    }
  }

  const todoList = (
    todos.map((todo, index) => (
      <Card
        key={todo.id || index}
        variation="outlined"
        style={styles.todoCard}
      >
        <Heading level={4}>
          {todo.name}
        </Heading>
        <Text>
          {todo.description}
        </Text>

        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Text
            style={styles.dateTime}
          >
            {new Date(todo.updatedAt).toLocaleString('zh')}
          </Text>
          <MdDelete
            style={styles.todoDelete}
            onClick={() => removeTodo(todo)}
          />
        </Flex>
      </Card>
    ))
  )

  return (
    <Authenticator variation="modal">
      {({ signOut, user }) => (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1>Hello, {user.username}</h1>
            <Button
              size='small'
              isFullWidth={true}
              loadingText='Loading...'
              ariaLabel='sign out'
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
          <br />

          <Heading level={2}>
            Amplify Todos
          </Heading>

          <TextField
            type='text'
            label='Name'
            placeholder='Enter todo name'
            value={formData.name}
            onChange={event => setInput('name', event.target.value)}
          />

          <TextField
            label='Description'
            placeholder='Enter todo description'
            value={formData.description}
            onChange={event => setInput('description', event.target.value)}
          />

          <Button
            variation='primary'
            isFullWidth={true}
            loadingText='Loading...'
            ariaLabel='create todo'
            onClick={addTodo}
            style={styles.createButton}
          >
            Create Todo
          </Button>

          {todoList}
        </div>
      )}
    </Authenticator>
  )
}

const styles = {
  container: { width: 600, margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  header: { padding: 16, textAlign: 'center', backgroundColor: '#ebebeb', borderRadius: 16 },
  todoCard: { position: 'relative', marginTop: 32 },
  todoDelete: { width: 20, height: 20, cursor: 'pointer' },
  dateTime: { fontSize: 12, color: '#9a9a9a' },
  createButton: { marginTop: 16 },
}

export default App
