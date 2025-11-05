# Blog Setup with Social Media Thumbnails

This README explains how to manage your blog posts with proper social media thumbnail support.

## 📁 File Structure

```
.
├── BLOGS/
│   ├── blogs.json                    # Main blog index
│   ├── how-to-roast-a-warden/
│   │   ├── blog.md                   # Blog content (markdown)
│   │   └── src/
│   │       └── win.png              # Images for this blog
│   └── ...
├── posts/                             # Generated static pages (auto-generated)
│   ├── how-to-roast-a-warden.html
│   └── ...
├── generate-blog-pages.js            # Generator script
├── blog-template.html                # Template for static pages
├── blogs.html                        # Blog listing page
└── blog.html                         # Original dynamic blog viewer (backup)
```

## ✨ How It Works

### 1. **blogs.json** - The Central Registry

This file contains metadata for all your blogs AND projects:

```json
{
  "blogs": [
    {
      "title": "Your Blog Title",
      "folder": "your-blog-folder",
      "date": "2025-01-15",
      "author": "Rishabh",
      "excerpt": "A short description that appears in social media previews",
      "thumbnail": "/BLOGS/your-blog-folder/src/thumbnail.png"
    }
  ],
  "projects": [
    {
      "title": "Your Project Title",
      "folder": "your-project-folder",
      "date": "2025-01-15",
      "author": "Rishabh",
      "excerpt": "Project description for social media",
      "thumbnail": "/BLOGS/your-project-folder/src/thumbnail.png",
      "url": "https://github.com/yourusername/project"
    }
  ]
}
```

**Important fields:**
- `thumbnail`: Relative path to your thumbnail image
- `excerpt`: Description shown when sharing on social media
- `folder`: Must match the folder name in BLOGS/
- `url` (projects only, optional): External URL for the project. If not provided, uses posts/{folder}.html

### 2. **Static Page Generation**

When you run the generator script, it creates individual HTML files for each blog with:
- ✅ Static Open Graph meta tags (for Facebook, LinkedIn, Discord)
- ✅ Static Twitter Card meta tags
- ✅ Absolute URLs for thumbnails (required by social media platforms)
- ✅ All the styling and lightbox functionality

## 🚀 Adding a New Blog Post or Project

### Adding a Blog Post

### Step 1: Create Your Blog Content

1. Create a new folder in `BLOGS/`:
   ```bash
   mkdir BLOGS/my-new-blog
   ```

2. Write your blog in markdown:
   ```bash
   # Create the markdown file
   touch BLOGS/my-new-blog/blog.md
   ```

3. Add images to the src folder:
   ```bash
   mkdir BLOGS/my-new-blog/src
   # Copy your images here, including a thumbnail
   ```

### Step 2: Update blogs.json

Add your new blog entry to the `blogs` array in `BLOGS/blogs.json`:

```json
{
  "blogs": [
    {
      "title": "My New Blog Post",
      "folder": "my-new-blog",
      "date": "2025-01-15",
      "author": "Rishabh",
      "excerpt": "This is what people will see when I share this blog on WhatsApp or Twitter!",
      "thumbnail": "/BLOGS/my-new-blog/src/thumbnail.png"
    }
  ],
  "projects": []
}
```

### Step 3: Generate Static Pages

Run the generator script:

```bash
node generate-blog-pages.js
```

You'll see output like:
```
🚀 Starting blog page generation...
✅ Created output directory: ./posts
📚 Found 4 blog posts

✅ [1/4] Generated: posts/my-new-blog.html
   📝 Title: My New Blog Post
   🖼️  Thumbnail: /BLOGS/my-new-blog/src/thumbnail.png
...
```

### Step 4: Commit and Push

```bash
git add .
git commit -m "Add new blog post: My New Blog"
git push
```

---

### Adding a Project to Project Continuum

Projects appear in the "Project Continuum" section on the blogs page. They work similarly to blog posts but can also link to external URLs (like GitHub repos).

#### Option 1: Project with External Link (e.g., GitHub)

Add to the `projects` array in `BLOGS/blogs.json`:

```json
{
  "blogs": [...],
  "projects": [
    {
      "title": "My Awesome Security Tool",
      "folder": "security-tool-project",
      "date": "2025-01-15",
      "author": "Rishabh",
      "excerpt": "A cutting-edge security tool for ethical hackers",
      "thumbnail": "/BLOGS/security-tool-project/src/thumbnail.png",
      "url": "https://github.com/yourusername/security-tool"
    }
  ]
}
```

When users click this project, they'll be taken directly to the GitHub URL!

#### Option 2: Project with Detailed Write-up

If you want to write a detailed project page (like a blog post):

1. Create the project folder and content:
   ```bash
   mkdir -p BLOGS/my-project/src
   echo "# My Project" > BLOGS/my-project/blog.md
   ```

2. Add to `projects` array WITHOUT the `url` field:
   ```json
   {
     "title": "My Project",
     "folder": "my-project",
     "date": "2025-01-15",
     "author": "Rishabh",
     "excerpt": "Detailed project description",
     "thumbnail": "/BLOGS/my-project/src/thumbnail.png"
   }
   ```

3. Run the generator to create the static page:
   ```bash
   node generate-blog-pages.js
   ```

This creates `posts/my-project.html` with the full write-up!

## 📱 Testing Social Media Previews

### Local Testing

```bash
# Start a local server
python -m http.server 8000

# Visit in browser
http://localhost:8000/posts/my-new-blog.html
```

### Production Testing

After pushing to GitHub:

1. **For Twitter**: Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - Enter: `https://rishabhyadavm07.github.io/posts/my-new-blog.html`

2. **For Facebook/LinkedIn**: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Enter: `https://rishabhyadavm07.github.io/posts/my-new-blog.html`

3. **For WhatsApp**: Just paste the link and send it to yourself!

## 🔧 Troubleshooting

### Thumbnails not showing on social media?

1. ✅ Check that `thumbnail` path in blogs.json is correct
2. ✅ Make sure you ran `node generate-blog-pages.js` after updating blogs.json
3. ✅ Verify the image is actually uploaded to your repository
4. ✅ Clear the cache on the social media platform:
   - Twitter: Use Card Validator
   - Facebook: Use Sharing Debugger
   - WhatsApp: Wait a few minutes or clear chat

### "Error loading blog post"?

1. ✅ Check that the `folder` name in blogs.json matches the actual folder in BLOGS/
2. ✅ Make sure there's a `blog.md` file inside the blog folder
3. ✅ Check browser console for specific error messages

### Links not working?

1. ✅ Make sure you regenerated pages after updating blogs.json
2. ✅ Check that all files in `posts/` are committed to git
3. ✅ Verify file names match exactly (case-sensitive)

## 🎨 Customization

### Change Base URL

If you're using a custom domain, edit `generate-blog-pages.js`:

```javascript
const BASE_URL = 'https://your-custom-domain.com';
```

### Modify Blog Template

Edit `blog-template.html` to change:
- Styling
- Layout
- Meta tags
- Back link destination

Then regenerate all pages:
```bash
node generate-blog-pages.js
```

## 📋 Quick Reference

```bash
# Add a new blog
1. Create BLOGS/new-blog/blog.md
2. Add thumbnail to BLOGS/new-blog/src/
3. Add to "blogs" array in BLOGS/blogs.json
4. Run: node generate-blog-pages.js
5. git add . && git commit -m "New blog" && git push

# Add a new project (with external link)
1. Add to "projects" array in BLOGS/blogs.json with "url" field
2. No need to create folder or run generator (external link only)
3. git add . && git commit -m "New project" && git push

# Add a new project (with write-up page)
1. Create BLOGS/new-project/blog.md
2. Add thumbnail to BLOGS/new-project/src/
3. Add to "projects" array in BLOGS/blogs.json (WITHOUT "url" field)
4. Run: node generate-blog-pages.js
5. git add . && git commit -m "New project" && git push

# Update an existing blog/project
1. Edit the blog.md file
2. Run: node generate-blog-pages.js (if you changed blogs.json)
3. git add . && git commit -m "Update blog" && git push

# Change thumbnail for existing blog/project
1. Update thumbnail path in blogs.json
2. Run: node generate-blog-pages.js
3. git add . && git commit -m "Update thumbnail" && git push
```

## 💡 Pro Tips

1. **Thumbnail size**: Use images at least 1200x630px for best social media display
2. **File format**: PNG or JPG works best
3. **Excerpt length**: Keep it under 200 characters for best display
4. **Testing**: Always test locally before pushing to production
5. **Re-generate**: Run `node generate-blog-pages.js` whenever you update blogs.json

---

**Questions?** Open an issue or contact: rishabhyadav.inbox@gmail.com
