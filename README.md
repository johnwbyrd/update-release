# update-release

a smarter way to make fresh build assets continuously available, with Github actions

![Release of a white dove](img/dove-release.jpg)

- [update-release](#update-release)
  - [quick start](#quick-start)
    - [quick start for builds lasting more than an hour](#quick-start-for-builds-lasting-more-than-an-hour)
  - [summary](#summary)
  - [why another build publisher?](#why-another-build-publisher)
  - [guide](#guide)
  - [inputs](#inputs)
    - [token](#token)
    - [files](#files)
    - [release](#release)
    - [tag](#tag)
    - [message](#message)
    - [body](#body)
    - [prerelease](#prerelease)
    - [draft](#draft)
  - [outputs](#outputs)
    - [files](#files-1)
    - [draft](#draft-1)
    - [prerelease](#prerelease-1)
    - [release](#release-1)
    - [tag](#tag-1)
  - [internals](#internals)
    - [security concerns](#security-concerns)
  - [problems?](#problems)

## quick start

Insert the following into the appropriate step in your `.github/workflows/*.yml` file:

    - name: Update release
      uses: johnwbyrd/update-release@v1
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        files: ./one-file-you-want-to-release.zip dist/another-file-to-release.exe README.md

### quick start for builds lasting more than an hour

The `${{ secrets.GITHUB_TOKEN }}` is valid for exactly an hour from the time your build starts.  If your build requires longer than an hour to run, you will need to [create your own access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with repo admin access, [store it as a secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) in your own repository, and reference that secret token in your build:

    - name: Update release
      uses: johnwbyrd/update-release@v1
      with:
        token: ${{ secrets.YOUR_PRIVATE_SECRET_TOKEN }}
        asset: ./the-file-you-want-to-release.zip

## summary

[This Github action](https://www.github.com/johnwbyrd/update-release) allows you, and anyone you choose, to easily get access to files created as part of your continuous integration on [Github runners](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/virtual-environments-for-github-hosted-runners).

If you use Github to build digital assets such as zip files or executables, this action makes accessing your build products easy for everyone involved with your project.

Github has a very walled-garden, hands-on philosophy about what a "release" should be.  According to Github, a release *must* be tagged by a human; release artifacts *must* be built by a human; and then specific binary assets *must be* uploaded by a human into that release.

This update-release action *breaks down* those expectations.  Any branch, tag, or indeed *any Github checkin at all*, can now be continuously integrated via Github runners, with its build products continuously accessible to you, your team, or the world, via Github releases.

With this action, Github runners can build, test, and package artifacts on *any* Github ref, branch, or tag.  This action continuously creates and updates the necessary Github tags and releases with these artifacts.

This update-release action makes sane choices all the way along this process, but it lets you override those choices easily. Every time a Github runner builds your source code, update-release creates or updates a [Github release](https://help.github.com/en/github/administering-a-repository/creating-releases) for your assets, and then uploads the freshly built assets into your release.  Existing releases are reused, and existing assets with the same names are replaced.

Because this action is written in [TypeScript](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) and executes in [node.js](https://nodejs.org/en/), it runs on *all* Github's supported build runner platforms. These include Windows, MacOS, and Ubuntu as of this writing.

## why another build publisher?

Because no existing Github action implements *all* of what is needed to do continuous releasing on Github.

Github's new [actions](https://github.com/features/actions) system permits a user to perform a build on Windows, MacOS, or Ubuntu.  Classically, the result of a build is usually a zip file or some other distribution file that developers would like to download and distribute.  

But getting a file result out of any Github action build process is harder than it ought to be.  Sure, you could upload the file to your own server at build completion, but then you'd be ignoring Github's own file distribution and release architecture.

You'll have to check for the existence of any release before you create it, and you'll have to check for the existence of any asset already in a release with the same name, and delete it, before you upload the newly built asset.

Or, you could just use this Github action, update-release, which does all that in one step.  As of this writing, no other continuous integration plugin makes sane choices for all these steps.

## guide

Once your build has successfully completed, update-release will choose a friendly release name for your build.  Regardless of whether the ref that triggered the build is a tag or a branch, you'll get a human-friendly release name.  You can of course override the default choice. If the Github release name already exists, it is reused; otherwise, it is created.

## inputs

The following parameters are accepted as inputs to the update-release action.

### token

This should be [your secure Github token](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token). Use `${{ secrets.GITHUB_TOKEN }}` as the parameter if your build lasts less than an hour.

If your build lasts more than an hour, you will need to [create your own access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with repo admin access, [store it as a secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) in your own repository, and reference that secret token in your build.

This parameter is required.

### files

This should be the paths to files that you wish to add to the release.  Presumbly, this should include at least the file(s) you just built.  File paths can be provided as absolute paths, or they can alternately be relative to `${{ github.workspace }}`.  

This parameter is required.

### release
    
The name of the release to be created. A reasonable looking release name will be created from the current `${{ github.ref }}` if this input is not supplied. This reasonable looking default is created by taking `${{ github.ref }}`, removing the prefixes `refs/`, `heads/`, and `tags/` , and then replacing any remaining forward-slash symbols `/` with dashes `-`.

If you don't like this behavior, just override the release name here yourself.

This parameter is not required.

### tag

The name of the tag to be created. For some inexplicable reason, Github thinks that you need to have a tag corresponding to every release, which makes no sense if you're using Github to do continuous integration builds.  The tag will be the same as the calculated name of the release, if this input is not supplied. 

This parameter is not required.

### message

A brief description of the tag and also of the release. This parameter is not required.

### body

A longer decsription of the release, if it is created. This parameter is not required.

### prerelease

Should the release, if created, be marked as a prerelease?  Such releases are generally publicly visible.  Provide true or false as a parameter.

The default setting is `true`.

### draft

Should the release, if created, be marked as a draft?  Such releases are generally not publicly visible.  Provide true or false as a parameter.

The default setting is `false`.
    
## outputs

If assets are successfully published, you will get the following outputs from the step, which you can use in later processing.

The following parameters are provided as outputs to this Github action.

### files

The calculated local paths of the files to be uploaded into the release.

### draft

Whether the release, if created, was marked as a draft.

### prerelease

Whether the release, if created, was marked as a prerelease.

### release

The name of the release.

### tag

The tag used to create the release.

## internals

This Github action was written for [node.js](https://nodejs.org/en/) in [TypeScript](https://github.com/johnwbyrd/update-release), and it uses [webpack](https://webpack.js.org/) in order to run [ESLint](https://eslint.org/) before bundling.  Use [npm install](https://docs.npmjs.com/cli/install) to install all package.json dependencies of update-release, before hacking on it.

Development is done in Visual Studio Code.  It's necessary to manually build a target before debugging it.  The `test` target is for debugging; `test-watch` watches for and recompiles any changes for debugging; `bundle` minifies the current `src/main.ts` into `dist/main.js` for release.

Several [npm](https://www.npmjs.com/) targets were added to speed along development.  The `test` run target builds readable `dist/main.js` and `dist/main.map.js` files, for source-level debugging of the TypeScript.  A `test-watch` run target watches the `src/main.ts` file for changes, and lints and recompiles it as needed.  And, a `bundle` run target prepares a production minified `dist/main.js`.

This action uses the `dotenv` import in order to facilitate debugging.  This import reads a `.env` file, if it exists, as the root of the installation, and uses it to populate environmental variables for local testing of update-release.  A typical .env file for developing update-release, might look something like this:

    INPUT_ASSET=your-build-asset.zip
    INPUT_TOKEN=00000000000000000000000000000001
    GITHUB_REPOSITORY=you/your-repo
    GITHUB_REF=refs/heads/master
    GITHUB_WORKSPACE=/absolute/local/path/to/workspace

Using an `.env` file, you can perform local testing and debugging of update-release without having to build a product first.

### security concerns

You *should* review the source code of this -- and *all other!* -- Github actions, to verify that they don't store, transmit, or otherwise mistreat your secure Github token.

When you provide your secure access token to any Github action, you're essentially giving the code in that action permission to do whatever it wants to your repository.  *Don't* just hand over your security tokens to any Github actions, for which the sources are not available!

For extra peace of mind, please review src/main.ts *in detail*; also, feel free to rebuild main.js using `npm run bundle`, to make sure that the minified main.js corresponds exactly to main.ts.

As an extra protection, src/main.ts tries to helpfully mark the token that you provide it as a secret, so that it doesn't inadvertently sneak into any log files.

## problems?

I welcome all reasonable patches and improvements as merge requests against [this repository](https://github.com/johnwbyrd/update-release).  If you can make the code better, please help me to do so!