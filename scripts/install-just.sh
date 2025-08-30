#!/bin/bash

# Install Just command runner
# Just is a handy way to save and run project-specific commands

echo "🔧 Installing Just command runner..."

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "Detected OS: ${MACHINE}"

# Install Just based on OS
if [[ "$MACHINE" == "Linux" ]]; then
    # Linux installation
    if command -v cargo >/dev/null 2>&1; then
        echo "Installing Just via Cargo..."
        cargo install just
    elif command -v snap >/dev/null 2>&1; then
        echo "Installing Just via Snap..."
        sudo snap install --edge just
    else
        echo "Installing Just via curl..."
        curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        export PATH="$HOME/.local/bin:$PATH"
    fi
elif [[ "$MACHINE" == "Mac" ]]; then
    # macOS installation
    if command -v brew >/dev/null 2>&1; then
        echo "Installing Just via Homebrew..."
        brew install just
    elif command -v cargo >/dev/null 2>&1; then
        echo "Installing Just via Cargo..."
        cargo install just
    else
        echo "Please install Homebrew or Rust first"
        exit 1
    fi
else
    echo "Unsupported OS. Please install Just manually from https://github.com/casey/just"
    exit 1
fi

# Verify installation
if command -v just >/dev/null 2>&1; then
    echo "✅ Just installed successfully!"
    echo "Version: $(just --version)"
    echo ""
    echo "🚀 You can now use Just commands:"
    echo "  just dev        # Start development servers"
    echo "  just build      # Build for production"
    echo "  just --list     # Show all available commands"
else
    echo "❌ Just installation failed"
    echo "You can still use npm scripts or make commands"
    exit 1
fi
