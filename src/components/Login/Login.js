import React from 'react'
import * as EmailValidator from 'email-validator'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import { apiClient } from '../../utils/apiClient'

const useStyles = () => {
  return {
    container: {
      textAlign: 'center',
    },
    loginForm: {
      height: '16em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'calc(10px + 2vmin)',
    },
    loginTitle: {
      height: '2em',
    },
    emailInput: {
      marginBottom: '2em',
    },
    loginButton: {
      margin: '0',
      height: '4em'
    },
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props)

    this._isDestroyed = false

    this.state = {
      isEmailValid: false,
      email: '',
      tryingToLogin: false,
    }
  }

  componentWillUnmount() {
    this._isDestroyed = true
  }

  verifyEmailAddress = (email) => {
    const isEmailValid = EmailValidator.validate(email)
    this.setState({ isEmailValid })
  }

  loginClickHandler = () => {
    this.tryToLogin()
  }

  handleEditUpdate = (e) => {
    if (e && e.target && e.target.value) {
      this.setState({ email: e.target.value })
      this.verifyEmailAddress(e.target.value)
    }
  }

  handleEditKeyUp = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      if (this.state.isEmailValid === false) {
        return
      }

      this.tryToLogin()
    }
  }

  tryToLogin = () => {
    this.setState({ tryingToLogin: true })

    apiClient
      .login({ email: this.state.email })
      .then((response) => {
        if (this._isDestroyed) return

        this.setState({ tryingToLogin: false })
        this.props.onLogin(response.email, response.oneTimePassword)
      })
      .catch((err) => {
        this.setState({ tryingToLogin: false })
      })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <header className={classes.loginForm}>
          <div className={classes.loginTitle}>Log in to Rooms</div>
          <TextField
            className={classes.emailInput}
            color="secondary"
            variant="outlined"
            defaultValue={this.state.email}
            label="e-mail"
            onChange={this.handleEditUpdate}
            onKeyUp={this.handleEditKeyUp}
            disabled={this.state.tryingToLogin}
          />

          {(this.state.isEmailValid === true) ?
            <div className={classes.loginButton}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.loginClickHandler}
                disabled={this.state.tryingToLogin}
              >
                Connect
              </Button>
            </div> :
            <div className={classes.loginButton} />
          }
        </header>
      </div>
    )
  }
}

export default withStyles(useStyles)(Login)