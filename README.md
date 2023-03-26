# Hljóðstafir
  Hljóðstafir allows you to automatically sync audio and text highlighting on a sentence level.
  
  ### How to run after installation
  Select the language and any experimental features then upload the epub.
  Hljóðstafir will process the epub file, any issues will be relayed back to the user.
  Feel free to add tickets to solve any issues you may run into as there are many edge cases that will need to be handled in the future.

## Known Issues
  1. Aeneas may stall without any feedback on longer audio files when running on a Windows OS, therefore it's best to run it on a distro known to support Aeneas. Debian and Ubuntu do not seem to deal with this issue.

  ## Docker
  Build docker image with Dockerfile

    docker build -t hljodstafir .

---

  ## Manual Installation - Linux
  1. Make sure you have python and python cli calls python3 not 2.7

    apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-dev python-is-python3 curl wget git
  2. Install Node and yarn
    
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs build-essential && npm install --global yarn
  3. Install Aeneas dependencies

    wget https://raw.githubusercontent.com/readbeyond/aeneas/master/install_dependencies.sh
    bash install_dependencies.sh
  4. Install python dependencies & aeneas
    
    pip3 install numpy mutagen html5lib 
    pip3 install aeneas
    pip3 install PyMuPDF==1.16.14
  5. Check whether you installed **aeneas** correctly
    
    python -m aeneas.diagnostics
  6. Install node modules 
    
    yarn install
  7. Add required private keys to .env.local
  8. Run Webapp (production or development)
    
    yarn build && yarn start
    yarn dev