import React from 'react';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import MaterialLink from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';

interface Values {
  email?: string;
  password?: string;
}

const useStyles = makeStyles(theme => ({
  close: {
    color: theme.palette.common.white,
  },
  form: {
    paddingTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const validate = (values: Values) => {
  let errors: Values = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
};

function UserForm({
  disabled,
  submitLabel,
}: {
  disabled: any;
  submitLabel: string;
}) {
  const classes = useStyles();

  return (
    <div className={classes.form}>
      <Form>
        <div className={classes.input}>
          <Field
            type="email"
            name="email"
            label="Email"
            component={TextField}
            fullWidth
          />
        </div>
        <Field
          type="password"
          name="password"
          label="Password"
          component={TextField}
          fullWidth
        />
        <div className={classes.submit}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={disabled}
          >
            {submitLabel}
          </Button>
        </div>
      </Form>
    </div>
  );
}

function Navbar() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div style={{ height: 60 }} />
      <AppBar position="fixed">
        <Toolbar>
          <Link to="/" className={classes.close}>
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export function SignUp() {
  return (
    <Container>
      <Navbar />
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={values => console.log(values)}
        validate={validate}
      >
        {({ isSubmitting }) => (
          <UserForm submitLabel="Sign Up" disabled={isSubmitting} />
        )}
      </Formik>
      <MaterialLink component={Link} to="/sign-in">
        I'm already registered
      </MaterialLink>
    </Container>
  );
}

export function SignIn() {
  return (
    <Container>
      <Navbar />
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={values => console.log(values)}
        validate={validate}
      >
        {({ isSubmitting }) => (
          <UserForm submitLabel="Sign In" disabled={isSubmitting} />
        )}
      </Formik>
      <MaterialLink to="/sign-up" component={Link}>
        I don't have an account
      </MaterialLink>
    </Container>
  );
}
