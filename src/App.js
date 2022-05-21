import React, { useEffect, useState } from 'react'
import TextFieldWrapper from './components/TextFieldWrapper'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import {
  Authenticator,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { createTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { MdDelete } from 'react-icons/md'

import awsExports from "./aws-exports"
Amplify.configure(awsExports)

const App = () => {
  const nameTextFieldRef = React.useRef(null)
  const descriptionTextFieldRef = React.useRef(null)

  const textFieldConfig = [
    {
      id: 'name',
      ref: nameTextFieldRef,
      label: 'Name',
      placeholder: 'Enter todo name',
    },
    {
      id: 'description',
      ref: descriptionTextFieldRef,
      label: 'Description',
      placeholder: 'Enter todo description',
    },
  ]

  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

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
      const name = nameTextFieldRef.current.value
      const description = descriptionTextFieldRef.current.value

      if (!name) return window.alert('Please enter your todo name')
      if (!description) return window.alert('Please enter your todo description')

      const todo = {
        name,
        description,
      }

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
    todos
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      .map((todo, index) => (
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

          {
            textFieldConfig.map(item => (
              <TextFieldWrapper
                key={item.id}
                ref={item.ref}
                label={item.label}
                placeholder={item.placeholder}
              />
            ))
          }

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
