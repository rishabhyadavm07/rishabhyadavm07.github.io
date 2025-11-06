#!/usr/bin/env node

/**
 * Blog Page Generator
 * This script generates individual HTML pages for each blog post with proper Open Graph meta tags
 * so that social media platforms (Twitter, WhatsApp, Facebook) can display thumbnails and previews.
 *
 * Usage: node generate-blog-pages.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOGS_JSON_PATH = './BLOGS/blogs.json';
const TEMPLATE_PATH = './blog-template.html';
const OUTPUT_DIR = './posts';
const BASE_URL = 'https://rishabhyadavm07.github.io'; // Change this to your actual domain

// Read blogs.json
function readBlogsData() {
    try {
        const data = fs.readFileSync(BLOGS_JSON_PATH, 'utf8');
        const parsedData = JSON.parse(data);

        // Handle both old format (array) and new format (object with blogs/projects)
        if (Array.isArray(parsedData)) {
            return { blogs: parsedData, projects: [] };
        }

        return {
            blogs: parsedData.blogs || [],
            projects: parsedData.projects || []
        };
    } catch (error) {
        console.error('Error reading blogs.json:', error);
        process.exit(1);
    }
}

// Read template
function readTemplate() {
    try {
        return fs.readFileSync(TEMPLATE_PATH, 'utf8');
    } catch (error) {
        console.error('Error reading template:', error);
        process.exit(1);
    }
}

// Generate HTML for a single blog post
function generateBlogPage(blog, template) {
    const title = blog.title || 'Blog Post';
    const description = blog.excerpt || blog.description || 'Read this blog post';
    const author = blog.author || 'Rishabh Yadav';
    const date = blog.date || '';
    const thumbnail = blog.thumbnail || '';
    const folder = blog.folder || '';
    const aiGenerated = blog.AI_generated || '';

    // Convert relative thumbnail URL to absolute
    const absoluteThumbnail = thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`;
    const absoluteUrl = `${BASE_URL}/posts/${folder}.html`;

    // Replace placeholders in template
    let html = template;
    html = html.replace(/\{\{TITLE\}\}/g, title);
    html = html.replace(/\{\{DESCRIPTION\}\}/g, description);
    html = html.replace(/\{\{AUTHOR\}\}/g, author);
    html = html.replace(/\{\{DATE\}\}/g, date);
    html = html.replace(/\{\{THUMBNAIL\}\}/g, absoluteThumbnail);
    html = html.replace(/\{\{URL\}\}/g, absoluteUrl);
    html = html.replace(/\{\{FOLDER\}\}/g, folder);
    html = html.replace(/\{\{AI_GENERATED\}\}/g, aiGenerated);

    return html;
}

// Main function
function main() {
    console.log('🚀 Starting blog page generation...\n');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
    }

    // Read data
    const data = readBlogsData();
    const template = readTemplate();

    const blogs = data.blogs || [];
    const projects = data.projects || [];
    const totalItems = blogs.length + projects.length;

    console.log(`📚 Found ${blogs.length} blog posts`);
    console.log(`🚀 Found ${projects.length} projects`);
    console.log(`📊 Total items to generate: ${totalItems}\n`);

    // Generate blog pages
    let successCount = 0;
    let currentIndex = 0;

    if (blogs.length > 0) {
        console.log('📝 Generating blog pages...\n');
        blogs.forEach((blog, index) => {
            try {
                const html = generateBlogPage(blog, template);
                const outputPath = path.join(OUTPUT_DIR, `${blog.folder}.html`);

                fs.writeFileSync(outputPath, html, 'utf8');
                currentIndex++;
                console.log(`✅ [${currentIndex}/${totalItems}] Generated: ${outputPath}`);
                console.log(`   📝 Title: ${blog.title}`);
                console.log(`   🖼️  Thumbnail: ${blog.thumbnail}`);
                console.log('');

                successCount++;
            } catch (error) {
                console.error(`❌ Error generating page for ${blog.folder}:`, error);
            }
        });
    }

    // Generate project pages
    if (projects.length > 0) {
        console.log('🚀 Generating project pages...\n');
        projects.forEach((project, index) => {
            try {
                const html = generateBlogPage(project, template);
                const outputPath = path.join(OUTPUT_DIR, `${project.folder}.html`);

                fs.writeFileSync(outputPath, html, 'utf8');
                currentIndex++;
                console.log(`✅ [${currentIndex}/${totalItems}] Generated: ${outputPath}`);
                console.log(`   📝 Title: ${project.title}`);
                console.log(`   🖼️  Thumbnail: ${project.thumbnail}`);
                console.log('');

                successCount++;
            } catch (error) {
                console.error(`❌ Error generating page for ${project.folder}:`, error);
            }
        });
    }

    console.log(`\n🎉 Successfully generated ${successCount}/${totalItems} pages!`);
    console.log(`   📝 ${blogs.length} blog pages`);
    console.log(`   🚀 ${projects.length} project pages`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Commit the generated pages to your repository');
    console.log('   2. Share links like: https://rishabhyadavm07.github.io/posts/how-to-roast-a-warden.html');
    console.log('   3. The thumbnails will now appear on WhatsApp, Twitter, etc!');
}

// Run the script
main();
