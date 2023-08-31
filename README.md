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

A live demo (read-only) is available at [cloudy.pages.dev](https://cloudy.pages.dev/bucket/cloudy-demo).

## Features

- **File Explorer** - Browse your R2 buckets and files.
- **Access Control** - Comprehensive access control rules for buckets and files.
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

## Access Control

### Global Read-Only Mode

To enable read-only mode for your deployment, set the `CLOUDY_READ_ONLY` environment variable to `true`.

When advanced access control is enabled, this setting is ignored.

### Advanced Access Control

Note: This is an entirely optional feature and your Cloudy instance will function perfectly fine without enabling it.

Cloudy comes with support for configurable rules about who should be able to access your buckets and files. For visibility, it is possible to declare a bucket as public or private, as well as read-only or read-write when publically accessible.

Future updates will include support on a more granular level, where you can use globs to provide different rules for different paths within a bucket, or for the entire bucket. Additionally, people will be able to authenticate with your instance of Cloudy and be granted user-specific access to buckets and files, each with their own rules.

#### Setup Steps

1. Create a new D1 database.
2. Add a D1 binding to your Pages project named `CLOUDY_D1`. (_Settings > Functions > D1 Database Bindings_).
3. Run the migrations against your database.
   - Create a wrangler.toml file and [add your D1 binding to it](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases).
   - Apply the migrations with `pnpm run migrations:apply CLOUDY_D1` (this uses Wrangler).
4. Set environment variables for authentication to use.
   - Set `AUTH_SECRET` to a random string.
   - Set `AUTH_GITHUB_ID` to your GitHub OAuth Client ID.
   - Set `AUTH_GITHUB_SECRET` to your GitHub OAuth Client Secret.
5. Deploy your Cloudy instance.

**Note: The first account to be created on your Cloudy instance will be granted admin permissions.**

## Contributing

Contributions are welcome! For large changes, please open an issue first to discuss what you would like to add.

During local development, this project uses [`cf-bindings-proxy`](https://github.com/james-elicx/cf-bindings-proxy) to allow you to use `next dev`. You must run the proxy in a separate terminal window to `next dev`, using `pnpm run proxy`.

## Extra Words

The visual design for Cloudy was inspired by [Spacedrive](https://github.com/spacedriveapp/spacedrive), an incredible open-source file explorer. I would strongly recommend checking it out!
