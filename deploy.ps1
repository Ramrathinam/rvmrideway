git add .
git commit -m "Auto deploy from npm script"
git push origin main
vercel --prod
