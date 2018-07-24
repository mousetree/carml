# CarML

A simple demo that allows you to take a photo on your phone and run it through a trained Google ML model.

### Usage

Create a service account and store the content of the JSON in a CREDS environment variable. Then:

    npm install
    npm start

To deploy, you can use now.sh by running:

    now -e CREDS="$CREDS" --public
