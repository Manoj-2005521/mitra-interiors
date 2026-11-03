function resolveInputSrc(src) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return src.startsWith("/") ? `./src${src}` : `./src/${src}`;
}
const fs = require('fs');
const path = require('path');
const Image = require("@11ty/eleventy-img");
const { bundleMainCss, postprocessCss } = require("./scripts/bundle-css");

async function imageShortcode(src, alt, sizes = "100vw", classes = "", fetchpriority = "auto") {
  let inputSrc = resolveInputSrc(src);
  
  let metadata = await Image(inputSrc, {
    widths: [400, 800, 1200, 1600, "auto"],
    formats: ["avif", "webp", "jpeg"],
    urlPath: "/images/",
    outputDir: "./_site/images/"
  });

  let imageAttributes = {
    alt,
    sizes,
    class: classes,
    loading: fetchpriority === "high" ? "eager" : "lazy",
    decoding: "async",
    fetchpriority: fetchpriority
  };

  return Image.generateHTML(metadata, imageAttributes);
}

async function preloadImageShortcode(src, sizes = "100vw") {
  let inputSrc = resolveInputSrc(src);
  
  let metadata = await Image(inputSrc, {
    widths: [400, 800, 1200, 1600, "auto"],
    formats: ["avif"],
    urlPath: "/images/",
    outputDir: "./_site/images/"
  });

  let avifSources = metadata.avif;
  if (!avifSources || avifSources.length === 0) return "";
  let srcset = avifSources.map(entry => entry.srcset).join(", ");
  let lowestSrc = avifSources[0].url;

  return `<link rel="preload" href="${lowestSrc}" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="${sizes}">`;
}

async function prefetchImageShortcode(src, sizes = "100vw") {
  let inputSrc = resolveInputSrc(src);
  
  let metadata = await Image(inputSrc, {
    widths: [400, 800, 1200, 1600, "auto"],
    formats: ["avif"],
    urlPath: "/images/",
    outputDir: "./_site/images/"
  });

  let avifSources = metadata.avif;
  if (!avifSources || avifSources.length === 0) return "";
  
  // Prefetch the 1200px and 800px versions for mid-to-high resolution devices
  let targetSource = avifSources.find(entry => entry.width === 1200) || avifSources[avifSources.length - 1];
  return `<link rel="prefetch" href="${targetSource.url}" as="image" type="image/avif">`;
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("preloadImage", preloadImageShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("prefetchImage", prefetchImageShortcode);

  eleventyConfig.addFilter("inlineFile", function(filePath) {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    try {
      return fs.readFileSync(absolutePath, 'utf8');
    } catch (e) {
      console.error(`Error inlining file ${filePath}:`, e);
      return "";
    }
  });
  // Bundle CSS components before build
  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.watchIgnores.add("src/style.css");
  eleventyConfig.watchIgnores.add("**/src/style.css");
  eleventyConfig.watchIgnores.add("**/style.css");

  eleventyConfig.on("eleventy.before", () => {
    bundleMainCss();
  });

  // Postprocess and minify CSS after compile
  eleventyConfig.on("eleventy.after", async () => {
    await postprocessCss();
  });

  // Passthrough file copies
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
