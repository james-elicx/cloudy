<p align="center">
  <h3 align="center">Cloudy</h3>

  <p align="center">
    Modern, self-hosted file explorer
    <br />
    for Cloudflare R2 Storage.
  </p>
</p>

---

Cloudy is a file explorer that allows you to easily manage your Cloudflare R2 buckets.

It is designed to be deployed to your own Cloudflare account with bindings added to the project.

## Features

- **File Explorer** - Browse your R2 buckets and files.
- **Preview Files** - Preview images and videos in the browser.
- **Upload Files** - Upload files to your buckets.

More features are planned and coming soon.

## Getting Started

To use Cloudy, you will need to clone the repository and install the dependencies.

```sh
# Clone the repository.
git clone https://github.com/james-elicx/cloudy
cd cloudy

# Install the dependencies.
pnpm install
```

Then, you can build it and deploy it to your own Cloudflare account.

```sh
# Build the project.
pnpm run pages:build

# Deploy it to Cloudflare Pages.
pnpm run pages:deploy
```

This project uses [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages), meaning that you will need to set the `nodejs_compat` compatibility flag in your Pages project settings (_Settings > Functions > Compatibility Flags_).

After that, you just need to add your R2 Bindings to your project 🙂.

### Read-Only Mode

To enable read-only mode for your deployment, set the `CLOUDY_READ_ONLY` environment variable to `true`.

## Contributing

Contributions are welcome! For length changes, please open an issue first to discuss what you would like to add.

During local development, this project uses [`cf-bindings-proxy`](https://github.com/james-elicx/cf-bindings-proxy) to allow you to use `next dev`. You must run the proxy in a separate terminal window to `next dev`, using `pnpm run proxy`.

## Extra Words

The design for Cloudy was inspired by [Spacedrive](https://github.com/spacedriveapp/spacedrive), an incredible open-source file explorer. I would strongly recommend checking it out!
