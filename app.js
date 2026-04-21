// Comms App - Export to Outlook functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Script starting...');
    
    const form = document.getElementById('commForm');
    const exportEmailBtn = document.getElementById('exportEmail');
    const notification = document.getElementById('notification');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const draftsList = document.getElementById('draftsList');
    const bannerInput = document.getElementById('bannerImage');
    const inlineImagesInput = document.getElementById('inlineImages');
    const bannerPreview = document.getElementById('bannerPreview');
    const bannerPreviewImg = document.getElementById('bannerPreviewImg');
    const inlinePreview = document.getElementById('inlinePreview');
    const sectionsContainer = document.getElementById('sectionsContainer');
    const addSectionBtn = document.getElementById('addSection');
    const emojiModal = document.getElementById('emojiModal');
    const emojiGrid = document.getElementById('emojiGrid');
    const imageGalleryModal = document.getElementById('imageGalleryModal');
    const galleryGrid = document.getElementById('galleryGrid');
    const closeGalleryBtn = document.getElementById('closeGallery');
    const uploadBannerBtn = document.getElementById('uploadBannerBtn');
    const uploadInlineBtn = document.getElementById('uploadInlineBtn');
    const galleryBannerBtn = document.getElementById('galleryBannerBtn');
    const galleryInlineBtn = document.getElementById('galleryInlineBtn');
    const editorContent = document.getElementById('body');
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    const closeEmojiBtn = document.getElementById('closeEmoji');

    // Debug: Check if critical elements exist
    console.log('exportEmailBtn:', exportEmailBtn);
    console.log('exportHTML button:', document.getElementById('exportHTML'));
    console.log('exportPDF button:', document.getElementById('exportPDF'));
    console.log('exportText button:', document.getElementById('exportText'));

    // Check for shared draft in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDraft = urlParams.get('shared');
    if (sharedDraft) {
        try {
            const draftData = JSON.parse(decodeURIComponent(sharedDraft));
            loadDraftData(draftData);
            showNotification('📥 Shared draft loaded successfully!', 'success');
            // Switch to Create Comm tab
            switchTab('create');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error loading shared draft:', error);
            showNotification('⚠️ Failed to load shared draft', 'error');
        }
    }

    // Store image data
    let bannerImageData = null;
    let inlineImagesData = [];
    // Stock images for gallery (using placeholder images)
    const stockImages = {
        business: [
            { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400', alt: 'Business meeting' },
            { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Office workspace' },
            { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', alt: 'Modern office' },
            { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', alt: 'Team collaboration' },
            { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400', alt: 'Business presentation' },
            { url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400', alt: 'Team meeting' }
        ],
        technology: [
            { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', alt: 'Technology abstract' },
            { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', alt: 'Laptop coding' },
            { url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', alt: 'Tech devices' },
            { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', alt: 'Data visualization' },
            { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400', alt: 'Coding screen' },
            { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', alt: 'Digital world' }
        ],
        people: [
            { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', alt: 'Team collaboration' },
            { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', alt: 'Professional woman' },
            { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', alt: 'Professional man' },
            { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400', alt: 'Diverse team' },
            { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400', alt: 'Video conference' },
            { url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400', alt: 'Team discussion' }
        ],
        nature: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', alt: 'Mountain landscape' },
            { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', alt: 'Forest path' },
            { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', alt: 'Sunset lake' },
            { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400', alt: 'Ocean waves' },
            { url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400', alt: 'Tropical beach' },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', alt: 'Nature scenery' }
        ],
        abstract: [
            { url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400', alt: 'Abstract blue' },
            { url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400', alt: 'Abstract gradient' },
            { url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=400', alt: 'Abstract pattern' },
            { url: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400', alt: 'Abstract colors' },
            { url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400', alt: 'Abstract waves' },
            { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', alt: 'Abstract gradient' }
        ]
    };

    let currentGalleryTarget = null; // 'banner' or 'inline'

    let sectionCounter = 0;
    let sections = [];
    
    // Expose to window for template loading
    window.sectionCounter = sectionCounter;
    window.sections = sections;

    // Tab Switching Function
    window.switchTab = function(tabName) {
        // Update tab buttons
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Load drafts list when switching to drafts tab
        if (tabName === 'drafts') {
            loadDraftsList();
        }
    }

    // Handle tab button clicks
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Emoji list
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
        '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
        '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
        '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
        '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐',
        '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
        '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
        '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
        '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
        '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
        '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
        '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
        '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'
    ];

    // Populate emoji grid
    if (emojiGrid) {
        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.type = 'button';
            emojiBtn.className = 'emoji-item';
            emojiBtn.textContent = emoji;
            emojiBtn.addEventListener('click', function() {
                insertEmoji(emoji);
            });
            emojiGrid.appendChild(emojiBtn);
        });
    }

    // Handle emoji button click
    const emojiBtnElement = document.getElementById('emojiBtn');
    if (emojiBtnElement && emojiModal) {
        emojiBtnElement.addEventListener('click', function() {
            emojiModal.classList.remove('hidden');
        });
    }

    // Close emoji modal
    if (closeEmojiBtn && emojiModal) {
        closeEmojiBtn.addEventListener('click', function() {
            emojiModal.classList.add('hidden');
        });
    }

    // Close emoji modal when clicking outside
    if (emojiModal) {
        emojiModal.addEventListener('click', function(e) {
            if (e.target.id === 'emojiModal') {
                this.classList.add('hidden');
            }
        });
    }

    // Insert emoji into body textarea
    function insertEmoji(emoji) {
        const bodyTextarea = document.getElementById('body');
        if (bodyTextarea) {
            const start = bodyTextarea.selectionStart;
            const end = bodyTextarea.selectionEnd;
            const text = bodyTextarea.value;
            
            bodyTextarea.value = text.substring(0, start) + emoji + text.substring(end);
            bodyTextarea.selectionStart = bodyTextarea.selectionEnd = start + emoji.length;
            bodyTextarea.focus();
        }
        
        if (emojiModal) {
            emojiModal.classList.add('hidden');
        }
    }

    // Helper function to get body content (works with both textarea and contenteditable)
    function getBodyContent() {
        const bodyElement = document.getElementById('body');
        if (!bodyElement) return '';
        return bodyElement.innerHTML || bodyElement.value || '';
    }

    // Helper function to set body content (works with both textarea and contenteditable)
    window.setBodyContent = function(content) {
        const bodyElement = document.getElementById('body');
        if (!bodyElement) return;
        if (bodyElement.contentEditable === 'true') {
            bodyElement.innerHTML = content;
        } else {
            bodyElement.value = content;
        }
    }

    // Rich Text Editor Functions
    if (toolbarBtns) {
        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const command = this.dataset.command;
                
                if (command === 'createLink') {
                    const url = prompt('Enter the URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else if (command) {
                    document.execCommand(command, false, null);
                }
                
                editorContent.focus();
            });
        });
    }

    // Update toolbar button states based on current selection
    if (editorContent) {
        editorContent.addEventListener('mouseup', updateToolbarState);
        editorContent.addEventListener('keyup', updateToolbarState);
    }

    function updateToolbarState() {
        toolbarBtns.forEach(btn => {
            const command = btn.dataset.command;
            if (command && command !== 'createLink') {
                if (document.queryCommandState(command)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    // Handle emoji insertion for rich text editor
    function insertEmoji(emoji) {
        if (editorContent) {
            editorContent.focus();
            document.execCommand('insertText', false, emoji);
        }
        
        if (emojiModal) {
            emojiModal.classList.add('hidden');
        }
    }

    // Image Gallery Functions
    function openImageGallery(target) {
        currentGalleryTarget = target;
        if (imageGalleryModal) {
            imageGalleryModal.classList.remove('hidden');
            loadGalleryImages('business'); // Default category
        }
    }

    function loadGalleryImages(category) {
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';
        const images = stockImages[category] || [];
        
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${image.url}" alt="${image.alt}">`;
            item.addEventListener('click', function() {
                selectGalleryImage(image.url);
            });
            galleryGrid.appendChild(item);
        });
    }

    function selectGalleryImage(imageUrl) {
        if (currentGalleryTarget === 'banner') {
            // Load image as banner
            fetch(imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        bannerImageData = {
                            data: e.target.result,
                            name: 'gallery-banner.jpg',
                            type: blob.type
                        };
                        if (bannerPreviewImg) {
                            bannerPreviewImg.src = e.target.result;
                        }
                        if (bannerPreview) {
                            bannerPreview.classList.remove('hidden');
                        }
                    };
                    reader.readAsDataURL(blob);
                });
        } else if (currentGalleryTarget === 'inline') {
            // Add image to inline images
            fetch(imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageIndex = inlineImagesData.length;
                        inlineImagesData.push({
                            data: e.target.result,
                            name: `gallery-inline-${imageIndex}.jpg`,
                            type: blob.type,
                            cid: `inline-image-${imageIndex}`
                        });
                        displayInlineImages();
                    };
                    reader.readAsDataURL(blob);
                });
        }
        
        if (imageGalleryModal) {
            imageGalleryModal.classList.add('hidden');
        }
        showNotification('Image added successfully!', 'success');
    // Display inline images in preview grid
    function displayInlineImages() {
        if (!inlinePreview) return;
        
        inlinePreview.innerHTML = '';
        inlineImagesData.forEach((imageData, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            const imageSrc = typeof imageData === 'string' ? imageData : imageData.data;
            previewItem.innerHTML = `
                <img src="${imageSrc}" alt="Inline image ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}">✕</button>
            `;
            inlinePreview.appendChild(previewItem);
        });
    }

    }

    // Gallery category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadGalleryImages(this.dataset.category);
        });
    });

    // Upload button handlers
    if (uploadBannerBtn && bannerInput) {
        uploadBannerBtn.addEventListener('click', function() {
            bannerInput.click();
        });
    }

    if (uploadInlineBtn && inlineImagesInput) {
        uploadInlineBtn.addEventListener('click', function() {
            inlineImagesInput.click();
        });
    }

    // Gallery button handlers
    if (galleryBannerBtn) {
        galleryBannerBtn.addEventListener('click', function() {
            openImageGallery('banner');
        });
    }

    if (galleryInlineBtn) {
        galleryInlineBtn.addEventListener('click', function() {
            openImageGallery('inline');
        });
    }

    // Close gallery modal
    if (closeGalleryBtn && imageGalleryModal) {
        closeGalleryBtn.addEventListener('click', function() {
            imageGalleryModal.classList.add('hidden');
        });
    }

    // Video Embed Functions
    function parseVideoUrl(url) {
        if (!url) return null;
        
        // YouTube patterns
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return {
                type: 'youtube',
                id: youtubeMatch[1],
                thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
                watchUrl: `https://www.youtube.com/watch?v=${youtubeMatch[1]}`
            };
        }
        
        // Vimeo patterns
        const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return {
                type: 'vimeo',
                id: vimeoMatch[1],
                thumbnail: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
                watchUrl: `https://vimeo.com/${vimeoMatch[1]}`
            };
        }
        
        return null;
    }

    function generateVideoHtml(videoData) {
        if (!videoData) return '';
        
        return `
            <div style="margin: 30px 0; text-align: center;">
                <a href="${videoData.watchUrl}" target="_blank" style="display: inline-block; position: relative; text-decoration: none;">
                    <img src="${videoData.thumbnail}" alt="Video thumbnail" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; display: block;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(255, 0, 0, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 0; height: 0; border-left: 25px solid white; border-top: 15px solid transparent; border-bottom: 15px solid transparent; margin-left: 8px;"></div>
                    </div>
                </a>
                <p style="margin-top: 10px; font-size: 14px; color: #525252;">
                    <a href="${videoData.watchUrl}" target="_blank" style="color: #0f62fe; text-decoration: none;">▶ Watch Video</a>
                </p>
            </div>
        `;
    }

    // AI Assistant Functions
    const aiPrompt = document.getElementById('aiPrompt');
    const aiTone = document.getElementById('aiTone');
    const aiLength = document.getElementById('aiLength');
    const generateContentBtn = document.getElementById('generateContent');
    const clearAIBtn = document.getElementById('clearAI');
    const aiOutput = document.getElementById('aiOutput');
    const aiResult = document.getElementById('aiResult');
    const useAIContentBtn = document.getElementById('useAIContent');
    const regenerateContentBtn = document.getElementById('regenerateContent');
    const templateBtns = document.querySelectorAll('.template-btn');

    // Template prompts
    const templates = {
        event: "Write a professional announcement about an upcoming event, including key details like date, location, and what attendees can expect.",
        update: "Write a company update communicating recent developments, achievements, or changes in a clear and engaging way.",
        invitation: "Write a meeting invitation that clearly states the purpose, date, time, and expected outcomes of the meeting.",
        newsletter: "Write an engaging newsletter introduction that welcomes readers and highlights the key topics covered in this edition.",
        launch: "Write an exciting product launch announcement that highlights key features, benefits, and availability.",
        reminder: "Write a friendly reminder about an upcoming event, including essential details and any action items."
    };

    // Handle template button clicks
    templateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const template = this.dataset.template;
            if (aiPrompt && templates[template]) {
                aiPrompt.value = templates[template];
                aiPrompt.focus();
            }
        });
    });

    // Generate content function (simulated AI)
    if (generateContentBtn) {
        generateContentBtn.addEventListener('click', function() {
            const prompt = aiPrompt ? aiPrompt.value.trim() : '';
            const tone = aiTone ? aiTone.value : 'professional';
            const length = aiLength ? aiLength.value : 'medium';

            if (!prompt) {
                showNotification('⚠️ Please describe what you want to write about', 'error');
                return;
            }

            // Show loading state
            generateContentBtn.disabled = true;
            generateContentBtn.textContent = '⏳ Generating...';

            // Simulate AI generation with a delay
            setTimeout(() => {
                const generatedContent = generateAIContent(prompt, tone, length);
                
                if (aiResult) {
                    aiResult.textContent = generatedContent;
                }
                if (aiOutput) {
                    aiOutput.classList.remove('hidden');
                }

                generateContentBtn.disabled = false;
                generateContentBtn.textContent = '✨ Generate Content';
                
                showNotification('✅ Content generated successfully!', 'success');
            }, 1500);
        });
    }

    // Simulated AI content generation
    function generateAIContent(prompt, tone, length) {
        // This is a placeholder that generates sample content
        // In a real implementation, this would call an AI API
        
        const toneAdjectives = {
            professional: ['pleased', 'excited', 'delighted'],
            friendly: ['thrilled', 'happy', 'glad'],
            formal: ['honored', 'privileged', 'pleased'],
            casual: ['pumped', 'stoked', 'excited'],
            enthusiastic: ['absolutely thrilled', 'incredibly excited', 'over the moon']
        };

        const lengthSentences = {
            short: 2,
            medium: 4,
            long: 7
        };

        const adj = toneAdjectives[tone][Math.floor(Math.random() * toneAdjectives[tone].length)];
        const sentences = lengthSentences[length];

        // Generate sample content based on prompt keywords
        let content = '';
        
        if (prompt.toLowerCase().includes('event') || prompt.toLowerCase().includes('summit') || prompt.toLowerCase().includes('conference')) {
            content = `We are ${adj} to announce our upcoming event that promises to bring together industry leaders and innovators. `;
            if (sentences >= 3) {
                content += `This gathering will feature keynote presentations, interactive workshops, and valuable networking opportunities. `;
            }
            if (sentences >= 5) {
                content += `Attendees will gain insights into the latest trends and best practices while connecting with peers from across the industry. `;
                content += `Don't miss this chance to expand your knowledge and professional network. `;
            }
            if (sentences >= 7) {
                content += `Registration is now open, and early bird pricing is available for a limited time. `;
                content += `We look forward to seeing you there and creating meaningful connections that drive innovation forward. `;
            }
            content += `Mark your calendars and join us for this exceptional experience.`;
        } else if (prompt.toLowerCase().includes('update') || prompt.toLowerCase().includes('announcement')) {
            content = `We are ${adj} to share some important updates with our community. `;
            if (sentences >= 3) {
                content += `These developments reflect our ongoing commitment to excellence and innovation. `;
            }
            if (sentences >= 5) {
                content += `Our team has been working diligently to bring you enhanced features and improved experiences. `;
                content += `We believe these changes will significantly benefit our stakeholders and strengthen our position in the market. `;
            }
            if (sentences >= 7) {
                content += `As we move forward, we remain focused on delivering value and exceeding expectations. `;
                content += `Thank you for your continued support and partnership as we embark on this exciting journey together. `;
            }
            content += `Stay tuned for more details in the coming weeks.`;
        } else if (prompt.toLowerCase().includes('meeting') || prompt.toLowerCase().includes('invitation')) {
            content = `You are cordially invited to join us for an important meeting to discuss key initiatives and strategic priorities. `;
            if (sentences >= 3) {
                content += `This session will provide an opportunity to align on objectives and share valuable insights. `;
            }
            if (sentences >= 5) {
                content += `We will review progress on current projects and explore new opportunities for collaboration. `;
                content += `Your input and expertise are highly valued, and we encourage active participation in the discussion. `;
            }
            if (sentences >= 7) {
                content += `Please come prepared with any questions or suggestions you would like to address. `;
                content += `We look forward to a productive conversation that drives our collective success forward. `;
            }
            content += `Please confirm your attendance at your earliest convenience.`;
        } else {
            // Generic content
            content = `We are ${adj} to share this important communication with you. `;
            if (sentences >= 3) {
                content += `This message contains valuable information that we believe will be of interest to our community. `;
            }
            if (sentences >= 5) {
                content += `Our team is committed to keeping you informed and engaged with relevant updates and insights. `;
                content += `We appreciate your continued interest and participation in our initiatives. `;
            }
            if (sentences >= 7) {
                content += `As always, we welcome your feedback and suggestions as we strive to improve our communications. `;
                content += `Thank you for being an important part of our community and for your ongoing support. `;
            }
            content += `We look forward to connecting with you soon.`;
        }

        return content;
    }

    // Use AI content button
    if (useAIContentBtn) {
        useAIContentBtn.addEventListener('click', function() {
            const content = aiResult ? aiResult.textContent : '';
            if (content && editorContent) {
                setBodyContent(content);
                switchTab('create');
                showNotification('✅ Content added to message body!', 'success');
            }
        });
    }

    // Regenerate content button
    if (regenerateContentBtn) {
        regenerateContentBtn.addEventListener('click', function() {
            if (generateContentBtn) {
                generateContentBtn.click();
            }
        });
    }

    // Clear AI form
    if (clearAIBtn) {
        clearAIBtn.addEventListener('click', function() {
            if (aiPrompt) aiPrompt.value = '';
            if (aiTone) aiTone.value = 'professional';
            if (aiLength) aiLength.value = 'medium';
            if (aiOutput) aiOutput.classList.add('hidden');
            if (aiResult) aiResult.textContent = '';
        });
    }

    // Close gallery modal when clicking outside
    if (imageGalleryModal) {
        imageGalleryModal.addEventListener('click', function(e) {
            if (e.target.id === 'imageGalleryModal') {
                this.classList.add('hidden');
            }
        });
    }

    // Handle Add Section
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function() {
            addSection();
        });
    }

    // Handle Remove Section
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-section')) {
            const sectionId = parseInt(e.target.dataset.sectionId);
            removeSection(sectionId);
        }
    });

    window.addSection = function() {
        sectionCounter++;
        window.sectionCounter = sectionCounter; // Keep window property in sync
        const sectionId = sectionCounter;
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section-item';
        sectionDiv.dataset.sectionId = sectionId;
        sectionDiv.innerHTML = `
            <div class="section-item-header">
                <span class="section-number">Section ${sectionCounter}</span>
                <button type="button" class="remove-section" data-section-id="${sectionId}">✕ Remove</button>
            </div>
            <div class="form-group">
                <label for="sectionTitle${sectionId}">Section Title</label>
                <input type="text" id="sectionTitle${sectionId}" class="section-title-input" placeholder="e.g., AI Summit, London">
            </div>
            <div class="form-group">
                <label for="sectionBody${sectionId}">Section Content</label>
                <textarea id="sectionBody${sectionId}" class="section-body-input" rows="5" placeholder="Event details and description"></textarea>
            </div>
        `;
        
        sectionsContainer.appendChild(sectionDiv);
        sections.push(sectionId);
        window.sections = sections; // Keep window property in sync
    }

    function removeSection(sectionId) {
        const sectionDiv = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionDiv) {
            sectionDiv.remove();
            sections = sections.filter(id => id !== sectionId);
        }
    }

    function getSectionsData() {
        return sections.map(id => {
            const titleInput = document.getElementById(`sectionTitle${id}`);
            const bodyInput = document.getElementById(`sectionBody${id}`);
            return {
                id: id,
                title: titleInput ? titleInput.value : '',
                body: bodyInput ? bodyInput.value : ''
            };
        }).filter(section => section.title || section.body);
    }

    // Handle banner image upload
    if (bannerInput) {
        bannerInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    bannerImageData = {
                        data: event.target.result,
                        name: file.name,
                        type: file.type
                    };
                    if (bannerPreviewImg) {
                        bannerPreviewImg.src = event.target.result;
                    }
                    if (bannerPreview) {
                        bannerPreview.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle inline images upload
    if (inlineImagesInput) {
        inlineImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            inlineImagesData = [];
            if (inlinePreview) {
                inlinePreview.innerHTML = '';
            }
            
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    inlineImagesData.push({
                        data: event.target.result,
                        name: file.name,
                        type: file.type,
                        cid: `inline-image-${index}`
                    });
                    
                    if (inlinePreview) {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'image-preview-item';
                        previewItem.innerHTML = `
                            <img src="${event.target.result}" alt="${file.name}">
                            <button type="button" class="remove-image" data-index="${index}">✕</button>
                        `;
                        inlinePreview.appendChild(previewItem);
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Handle remove image buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-image')) {
            const target = e.target.dataset.target;
            const index = e.target.dataset.index;
            
            if (target === 'banner') {
                bannerImageData = null;
                bannerInput.value = '';
                bannerPreview.classList.add('hidden');
            } else if (index !== undefined) {
                inlineImagesData.splice(index, 1);
                e.target.closest('.image-preview-item').remove();
            }
        }
    });

    // Handle Save Draft
    const saveDraftBtn = document.getElementById('saveDraft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveDraft();
        });
    }

    // Handle Load Draft
    const loadDraftBtn = document.getElementById('loadDraft');
    if (loadDraftBtn) {
        loadDraftBtn.addEventListener('click', function() {
            loadDraft();
        });
    }

    // Handle Preview
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            showPreview();
        });
    }

    // Handle Close Preview
    const closePreviewBtn = document.getElementById('closePreview');
    const previewModal = document.getElementById('previewModal');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function() {
            if (previewModal) {
                previewModal.classList.add('hidden');
            }
        });
    }

    // Close modal when clicking outside
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target.id === 'previewModal') {
                this.classList.add('hidden');
            }
        });
    }

    // Handle .eml export (Outlook Email)
    if (exportEmailBtn) {
        console.log('Adding click listener to exportEmail button');
        exportEmailBtn.addEventListener('click', function() {
            console.log('Export Email button clicked!');
            exportToEML();
        });
    } else {
        console.error('exportEmail button not found!');
    }

    // Handle HTML export
    const exportHTMLBtn = document.getElementById('exportHTML');
    if (exportHTMLBtn) {
        console.log('Adding click listener to exportHTML button');
        exportHTMLBtn.addEventListener('click', function() {
            console.log('Export HTML button clicked!');
            exportToHTML();
        });
    } else {
        console.error('exportHTML button not found!');
    }

    // Handle PDF export
    const exportPDFBtn = document.getElementById('exportPDF');
    if (exportPDFBtn) {
        console.log('Adding click listener to exportPDF button');
        exportPDFBtn.addEventListener('click', function() {
            console.log('Export PDF button clicked!');
            exportToPDF();
        });
    } else {
        console.error('exportPDF button not found!');
    }

    // Handle Plain Text export
    const exportTextBtn = document.getElementById('exportText');
    if (exportTextBtn) {
        console.log('Adding click listener to exportText button');
        exportTextBtn.addEventListener('click', function() {
            console.log('Export Text button clicked!');
            exportToPlainText();
        });
    } else {
        console.error('exportText button not found!');
    }

    // Handle Slack Integration
    const postToSlackBtn = document.getElementById('postToSlack');
    const slackModal = document.getElementById('slackModal');
    const closeSlackBtn = document.getElementById('closeSlack');
    const cancelSlackBtn = document.getElementById('cancelSlack');
    const sendToSlackBtn = document.getElementById('sendToSlack');

    if (postToSlackBtn) {
        postToSlackBtn.addEventListener('click', function() {
            if (slackModal) {
                slackModal.classList.remove('hidden');
            }
        });
    }

    if (closeSlackBtn) {
        closeSlackBtn.addEventListener('click', function() {
            if (slackModal) {
                slackModal.classList.add('hidden');
            }
        });
    }

    if (cancelSlackBtn) {
        cancelSlackBtn.addEventListener('click', function() {
            if (slackModal) {
                slackModal.classList.add('hidden');
            }
        });
    }

    if (sendToSlackBtn) {
        sendToSlackBtn.addEventListener('click', function() {
            postToSlack();
        });
    }

    // Close Slack modal when clicking outside
    if (slackModal) {
        slackModal.addEventListener('click', function(e) {
            if (e.target.id === 'slackModal') {
                this.classList.add('hidden');
            }
        });
    }

    // Handle Template Selection using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('use-template-btn')) {
            const templateType = e.target.getAttribute('data-template');
            if (templateType) {
                console.log('Calling loadTemplate with:', templateType);
                window.loadTemplate(templateType);
            }
        }
    });

    // Prevent form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }

    // Show Preview Function
    function showPreview() {
        const monthYear = document.getElementById('monthYear').value;
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const bodyElement = document.getElementById('body');
        const body = bodyElement ? (bodyElement.innerHTML || bodyElement.value || '') : '';
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        const ctaText = document.getElementById('ctaText').value;
        const ctaLink = document.getElementById('ctaLink').value;
        const videoUrlElement = document.getElementById('videoUrl');
        const videoUrl = videoUrlElement ? videoUrlElement.value : '';
        const location = document.getElementById('location').value;
        const sectionsData = getSectionsData();
        const titleColor = document.getElementById('titleColor').value;
        const bodyColor = document.getElementById('bodyColor').value;
        const subtitleColor = document.getElementById('subtitleColor').value;
        const ctaColor = document.getElementById('ctaColor').value;
        const videoData = parseVideoUrl(videoUrl);

        if (!title || !body) {
            showNotification('⚠️ Please fill in at least the Title and Message Body to preview', 'error');
            return;
        }

        // Build preview HTML
        let previewHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #161616;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            padding: 20px 30px;
            background-color: #f4f4f4;
        }
        .month-year {
            font-size: 14px;
            color: #525252;
        }
        .main-title {
            font-size: 32px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 30px 10px 30px;
            line-height: 1.2;
        }
        .subtitle {
            font-size: 18px;
            font-style: italic;
            color: ${subtitleColor};
            margin: 0 30px 30px 30px;
        }
        .content {
            padding: 0 30px 30px 30px;
            font-size: ${fontSize};
            color: ${bodyColor};
        }
        .content p {
            margin: 0 0 16px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${ctaColor};
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 0 15px 0;
        }
        .section-content {
            font-size: ${fontSize};
            color: ${bodyColor};
            margin-bottom: 20px;
        }
        .banner-container {
            position: relative;
            margin: 0 0 20px 0;
        }
        .banner-image {
            width: 600px;
            max-width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
        }
        .date-overlay {
            position: absolute;
            top: 20px;
            left: 30px;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            color: #161616;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .footer-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #525252;
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${bannerImageData ? `
        <div class="banner-container">
            <img src="${bannerImageData.data}" class="banner-image" alt="Banner">
        </div>
        ` : ''}
        
        <h1 class="main-title">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        ${monthYear ? `<div class="month-year" style="margin: 0 30px 20px 30px; font-size: 14px; color: #525252;">${monthYear}</div>` : ''}
        
        <div class="content">
            <p>${body.replace(/\n/g, '</p><p>')}</p>
            
            ${videoData ? generateVideoHtml(videoData) : ''}
            
            ${ctaText && ctaLink ? `<a href="${ctaLink}" class="cta-button">${ctaText} →</a>` : ''}
            
            ${sectionsData.map(section => `
                <div class="section-title">${section.title}</div>
                <div class="section-content">${section.body.replace(/\n/g, '</p><p>')}</div>
            `).join('')}
            
            ${location ? `<div class="footer-info"><p><strong>Location:</strong> ${location}</p></div>` : ''}
        </div>
    </div>
</body>
</html>`;

        // Display in iframe
        const iframe = document.getElementById('previewFrame');
        iframe.srcdoc = previewHTML;
        document.getElementById('previewModal').classList.remove('hidden');
    }

    // Save Draft Function
    function saveDraft() {
        const draftName = prompt('Enter a name for this draft:');
        if (!draftName) return;

        const tags = prompt('Add tags/categories (comma-separated, e.g., "Marketing, Q1 2026, Product Launch"):');
        const category = prompt('Select category (e.g., Newsletter, Event, Update, Announcement):') || 'General';

        const draftData = {
            name: draftName,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            category: category,
            monthYear: document.getElementById('monthYear').value,
            title: document.getElementById('title').value,
            subtitle: document.getElementById('subtitle').value,
            body: getBodyContent(),
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: document.getElementById('fontSize').value,
            titleColor: document.getElementById('titleColor').value,
            bodyColor: document.getElementById('bodyColor').value,
            subtitleColor: document.getElementById('subtitleColor').value,
            ctaColor: document.getElementById('ctaColor').value,
            ctaText: document.getElementById('ctaText').value,
            ctaLink: document.getElementById('ctaLink').value,
            videoUrl: document.getElementById('videoUrl') ? document.getElementById('videoUrl').value : '',
            location: document.getElementById('location').value,
            sections: getSectionsData(),
            bannerImageData: bannerImageData,
            inlineImagesData: inlineImagesData,
            savedAt: new Date().toISOString(),
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        };

        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        drafts.push(draftData);
        localStorage.setItem('commAppDrafts', JSON.stringify(drafts));
        showNotification(`✅ Draft "${draftName}" saved successfully!`, 'success');
    }

    // Load Draft Function - redirects to drafts tab
    function loadDraft() {
        switchTab('drafts');
    }

    // Load Drafts List
    function loadDraftsList() {
        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        
        if (drafts.length === 0) {
            draftsList.innerHTML = `
                <div class="empty-drafts">
                    <div class="empty-drafts-icon">📝</div>
                    <h3>No Drafts Yet</h3>
                    <p>Save your communications as drafts to access them here</p>
                </div>
            `;
            return;
        }

        draftsList.innerHTML = drafts.map((draft, index) => `
            <div class="draft-card">
                <div class="draft-card-header">
                    <div>
                        <div class="draft-title">${draft.name || 'Untitled'}</div>
                        <div class="draft-meta">
                            ${draft.category ? `<span class="draft-category">📁 ${draft.category}</span>` : ''}
                            <span class="draft-date">🕒 ${new Date(draft.savedAt).toLocaleString()}</span>
                        </div>
                        ${draft.tags && draft.tags.length > 0 ? `
                            <div class="draft-tags">
                                ${draft.tags.map(tag => `<span class="draft-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="draft-actions">
                        <button class="draft-btn draft-btn-load" onclick="loadDraftByIndex(${index})" title="Load draft">📂 Load</button>
                        <button class="draft-btn draft-btn-duplicate" onclick="duplicateDraft(${index})" title="Duplicate draft">📋 Duplicate</button>
                        <button class="draft-btn draft-btn-share" onclick="shareDraft(${index})" title="Share draft">🔗 Share</button>
                        <button class="draft-btn draft-btn-delete" onclick="deleteDraft(${index})" title="Delete draft">🗑️ Delete</button>
                    </div>
                </div>
                <div class="draft-preview">
                    <strong>Title:</strong> ${draft.title || 'No title'}<br>
                    <strong>Body:</strong> ${(draft.body || 'No content').substring(0, 100)}${draft.body && draft.body.length > 100 ? '...' : ''}
                </div>
            </div>
        `).join('');
    }

    // Duplicate Draft
    window.duplicateDraft = function(index) {
        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        const originalDraft = drafts[index];
        
        if (!originalDraft) {
            showNotification('⚠️ Draft not found', 'error');
            return;
        }
        
        // Create a copy with new ID and timestamp
        const duplicatedDraft = {
            ...originalDraft,
            id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: (originalDraft.name || 'Untitled') + ' (Copy)',
            savedAt: new Date().toISOString()
        };
        
        // Add to drafts array
        drafts.push(duplicatedDraft);
        localStorage.setItem('commAppDrafts', JSON.stringify(drafts));
        
        // Refresh the list
        loadDraftsList();
        showNotification('✅ Draft duplicated successfully!', 'success');
    };

    // Share Draft
    window.shareDraft = function(index) {
        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        const draft = drafts[index];
        
        if (!draft) {
            showNotification('⚠️ Draft not found', 'error');
            return;
        }
        
        // Encode draft data in URL
        const draftData = encodeURIComponent(JSON.stringify(draft));
        const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${draftData}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('🔗 Share link copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback: show the link in a prompt
            prompt('Share this link with your team:', shareUrl);
        });
    };

    // Helper function to load draft data into form
    function loadDraftData(draftData) {
        if (!draftData) {
            showNotification('⚠️ Draft not found', 'error');
            return;
        }

        // Restore form fields
        document.getElementById('monthYear').value = draftData.monthYear || '';
        document.getElementById('title').value = draftData.title || '';
        document.getElementById('subtitle').value = draftData.subtitle || '';
        setBodyContent(draftData.body || '');
        document.getElementById('fontFamily').value = draftData.fontFamily || "'IBM Plex Sans', sans-serif";
        document.getElementById('fontSize').value = draftData.fontSize || '16px';
        document.getElementById('titleColor').value = draftData.titleColor || '#161616';
        document.getElementById('bodyColor').value = draftData.bodyColor || '#161616';
        document.getElementById('subtitleColor').value = draftData.subtitleColor || '#525252';
        document.getElementById('ctaColor').value = draftData.ctaColor || '#0f62fe';
        document.getElementById('ctaText').value = draftData.ctaText || '';
        document.getElementById('ctaLink').value = draftData.ctaLink || '';
        if (document.getElementById('videoUrl')) {
            document.getElementById('videoUrl').value = draftData.videoUrl || '';
        }
        document.getElementById('location').value = draftData.location || '';

        // Restore sections
        sectionsContainer.innerHTML = '';
        sections = [];
        sectionCounter = 0;
        if (draftData.sections && draftData.sections.length > 0) {
            draftData.sections.forEach(section => {
                addSection();
                document.getElementById(`sectionTitle${sectionCounter}`).value = section.title || '';
                document.getElementById(`sectionBody${sectionCounter}`).value = section.body || '';
            });
        }

        // Restore images
        if (draftData.bannerImageData) {
            bannerImageData = draftData.bannerImageData;
            bannerPreviewImg.src = bannerImageData.data;
            bannerPreview.classList.remove('hidden');
        }

        if (draftData.inlineImagesData && draftData.inlineImagesData.length > 0) {
            inlineImagesData = draftData.inlineImagesData;
            inlinePreview.innerHTML = '';
            inlineImagesData.forEach((img, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${img.data}" alt="${img.name}">
                    <button type="button" class="remove-image" data-index="${index}">✕</button>
                `;
                inlinePreview.appendChild(previewItem);
            });
        }
    }

    // Load Draft by Index
    window.loadDraftByIndex = function(index) {
        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        const draftData = drafts[index];
        
        loadDraftData(draftData);
        
        if (draftData) {
            showNotification(`✅ Draft "${draftData.name}" loaded successfully!`, 'success');
            // Switch to create tab
            switchTab('create');
        }
    }

    // Delete Draft
    window.deleteDraft = function(index) {
        if (!confirm('Are you sure you want to delete this draft?')) return;
        
        const drafts = JSON.parse(localStorage.getItem('commAppDrafts') || '[]');
        const draftName = drafts[index].name;
        drafts.splice(index, 1);
        localStorage.setItem('commAppDrafts', JSON.stringify(drafts));
        
        showNotification(`✅ Draft "${draftName}" deleted`, 'success');
        loadDraftsList();
    }

    window.showNotification = function(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }

    function exportToEML() {
        const monthYear = document.getElementById('monthYear').value;
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = getBodyContent();
        const ctaText = document.getElementById('ctaText').value;
        const ctaLink = document.getElementById('ctaLink').value;
        const videoUrlElement = document.getElementById('videoUrl');
        const videoUrl = videoUrlElement ? videoUrlElement.value : '';
        const location = document.getElementById('location').value;
        const sectionsData = getSectionsData();
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        const videoData = parseVideoUrl(videoUrl);
        const titleColor = document.getElementById('titleColor').value;
        const bodyColor = document.getElementById('bodyColor').value;
        const subtitleColor = document.getElementById('subtitleColor').value;
        const ctaColor = document.getElementById('ctaColor').value;

        if (!title || !body) {
            showNotification('⚠️ Please fill in all required fields (Title, Body)', 'error');
            return;
        }

        const boundary = '----=_NextPart_' + Date.now();
        const hasImages = bannerImageData || inlineImagesData.length > 0;

        // Build EML content with HTML and images
        let emlContent = `From: sender@example.com\r\n`;
        emlContent += `To: \r\n`;
        emlContent += `Subject: ${title}\r\n`;
        emlContent += `Date: ${new Date().toUTCString()}\r\n`;
        emlContent += `MIME-Version: 1.0\r\n`;

        if (hasImages) {
            emlContent += `Content-Type: multipart/related; boundary="${boundary}"\r\n`;
            emlContent += `\r\n`;
            emlContent += `--${boundary}\r\n`;
        }

        emlContent += `Content-Type: text/html; charset=utf-8\r\n`;
        emlContent += `Content-Transfer-Encoding: quoted-printable\r\n`;
        emlContent += `\r\n`;

        // Build HTML email body with IBM-style template
        let htmlBody = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #161616;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            padding: 20px 30px;
            background-color: #f4f4f4;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .month-year {
            font-size: 14px;
            color: #525252;
        }
        .logo {
            max-width: 80px;
            height: auto;
        }
        .main-title {
            font-size: 32px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 30px 10px 30px;
            line-height: 1.2;
        }
        .subtitle {
            font-size: 18px;
            font-style: italic;
            color: ${subtitleColor};
            margin: 0 30px 30px 30px;
        }
        .content {
            padding: 0 30px 30px 30px;
            font-size: ${fontSize};
            color: ${bodyColor};
        }
        .content p {
            margin: 0 0 16px 0;
        }
        .section-content {
            font-size: ${fontSize};
            color: #161616;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${ctaColor};
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 0;
            font-weight: 600;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #0353e9;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 0 15px 0;
        }
        .section-content {
            font-size: 16px;
            color: ${bodyColor};
            margin-bottom: 20px;
        }
        .banner-container {
            position: relative;
            margin: 0 0 20px 0;
        }
        .banner-image {
            width: 600px;
            max-width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
        }
        .date-overlay {
            position: absolute;
            top: 20px;
            left: 30px;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            color: #161616;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .inline-images {
            margin: 20px 0;
        }
        .inline-images img {
            max-width: 100%;
            height: auto;
            display: block;
            margin-bottom: 10px;
        }
        .footer-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #525252;
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${bannerImageData ? `
        <div class="banner-container">
            <img src="cid:banner-image" class="banner-image" alt="Banner">
        </div>
        ` : ''}
        
        <h1 class="main-title">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        ${monthYear ? `<div class="month-year" style="margin: 0 30px 20px 30px; font-size: 14px; color: #525252;">${monthYear}</div>` : ''}
        
        <div class="content">
            <p>${body.replace(/\n/g, '</p><p>')}</p>
            
            ${videoData ? generateVideoHtml(videoData) : ''}
            
            ${ctaText && ctaLink ? `<a href="${ctaLink}" class="cta-button">${ctaText} →</a>` : ''}
            
            ${sectionsData.map(section => `
                <div class="section-title">${section.title}</div>
                <div class="section-content">${section.body.replace(/\n/g, '</p><p>')}</div>
            `).join('')}
            
            ${location ? `<div class="footer-info"><p><strong>Location:</strong> ${location}</p></div>` : ''}
        </div>
    </div>
</body>
</html>`;

        // Add inline images section if they exist
        if (inlineImagesData.length > 0) {
            const imagesHtml = inlineImagesData.map(img =>
                `<img src="cid:${img.cid}" alt="${img.name}">`
            ).join('\n            ');
            htmlBody = htmlBody.replace('</div>\n    </div>',
                `<div class="inline-images">\n            ${imagesHtml}\n        </div>\n        </div>\n    </div>`);
        }

        emlContent += htmlBody + '\r\n';

        // Add banner image as attachment
        if (bannerImageData) {
            emlContent += `\r\n--${boundary}\r\n`;
            emlContent += `Content-Type: ${bannerImageData.type}; name="${bannerImageData.name}"\r\n`;
            emlContent += `Content-Transfer-Encoding: base64\r\n`;
            emlContent += `Content-ID: <banner-image>\r\n`;
            emlContent += `Content-Disposition: inline; filename="${bannerImageData.name}"\r\n`;
            emlContent += `\r\n`;
            const bannerBase64 = bannerImageData.data.split(',')[1];
            emlContent += bannerBase64 + '\r\n';
        }

        // Add inline images as attachments
        inlineImagesData.forEach((img) => {
            emlContent += `\r\n--${boundary}\r\n`;
            emlContent += `Content-Type: ${img.type}; name="${img.name}"\r\n`;
            emlContent += `Content-Transfer-Encoding: base64\r\n`;
            emlContent += `Content-ID: <${img.cid}>\r\n`;
            emlContent += `Content-Disposition: inline; filename="${img.name}"\r\n`;
            emlContent += `\r\n`;
            const base64Data = img.data.split(',')[1];
            emlContent += base64Data + '\r\n';
        });

        if (hasImages) {
            emlContent += `\r\n--${boundary}--\r\n`;
        }

        // Create and download file
        const blob = new Blob([emlContent], { type: 'message/rfc822' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `comm-${Date.now()}.eml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✅ Email (.eml) with images exported successfully! Open with Outlook to view.', 'success');
    }

    // Export to HTML
    function exportToHTML() {
        console.log('exportToHTML function called');
        const monthYear = document.getElementById('monthYear').value;
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = getBodyContent();
        const ctaText = document.getElementById('ctaText').value;
        const videoUrlElement = document.getElementById('videoUrl');
        const videoUrl = videoUrlElement ? videoUrlElement.value : '';
        const videoData = parseVideoUrl(videoUrl);
        const ctaLink = document.getElementById('ctaLink').value;
        const location = document.getElementById('location').value;
        const sectionsData = getSectionsData();
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        const titleColor = document.getElementById('titleColor').value;
        const bodyColor = document.getElementById('bodyColor').value;
        const subtitleColor = document.getElementById('subtitleColor').value;
        const ctaColor = document.getElementById('ctaColor').value;

        if (!title || !body) {
            showNotification('⚠️ Please fill in at least the Title and Message Body', 'error');
            return;
        }

        // Build standalone HTML file
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #161616;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            padding: 20px 30px;
            background-color: #f4f4f4;
        }
        .month-year {
            font-size: 14px;
            color: #525252;
        }
        .main-title {
            font-size: 32px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 30px 10px 30px;
            line-height: 1.2;
        }
        .subtitle {
            font-size: 18px;
            font-style: italic;
            color: ${subtitleColor};
            margin: 0 30px 30px 30px;
        }
        .content {
            padding: 0 30px 30px 30px;
            font-size: ${fontSize};
            color: ${bodyColor};
        }
        .content p {
            margin: 0 0 16px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${ctaColor};
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            border-radius: 4px;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 0 15px 0;
        }
        .section-content {
            font-size: ${fontSize};
            color: ${bodyColor};
            margin-bottom: 20px;
        }
        .banner-container {
            position: relative;
            margin: 0 0 20px 0;
        }
        .banner-image {
            width: 600px;
            max-width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
        }
        .date-overlay {
            position: absolute;
            top: 20px;
            left: 30px;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            color: #161616;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .footer-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #525252;
        }
        .inline-images {
            margin: 20px 0;
        }
        .inline-images img {
            max-width: 100%;
            height: auto;
            display: block;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${bannerImageData ? `
        <div class="banner-container">
            <img src="${bannerImageData.data}" class="banner-image" alt="Banner">
        </div>
        ` : ''}
        
        <h1 class="main-title">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        ${monthYear ? `<div class="month-year" style="margin: 0 30px 20px 30px; font-size: 14px; color: #525252;">${monthYear}</div>` : ''}
        
        <div class="content">
            <p>${body.replace(/\n/g, '</p><p>')}</p>
            
            ${videoData ? generateVideoHtml(videoData) : ''}
            
            ${ctaText && ctaLink ? `<a href="${ctaLink}" class="cta-button">${ctaText} →</a>` : ''}
            
            ${sectionsData.map(section => `
                <div class="section-title">${section.title}</div>
                <div class="section-content">${section.body.replace(/\n/g, '</p><p>')}</div>
            `).join('')}
            
            ${inlineImagesData.length > 0 ? `
            <div class="inline-images">
                ${inlineImagesData.map(img => `<img src="${img.data}" alt="${img.name}">`).join('\n')}
            </div>
            ` : ''}
            
            ${location ? `<div class="footer-info"><p><strong>Location:</strong> ${location}</p></div>` : ''}
        </div>
    </div>
</body>
</html>`;

        // Create and download file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `comm-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✅ HTML file exported successfully!', 'success');
    }

    // Export to Plain Text
    function exportToPlainText() {
        console.log('exportToPlainText function called');
        const monthYear = document.getElementById('monthYear').value;
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = getBodyContent();
        const ctaText = document.getElementById('ctaText').value;
        const ctaLink = document.getElementById('ctaLink').value;
        const videoUrlElement = document.getElementById('videoUrl');
        const videoUrl = videoUrlElement ? videoUrlElement.value : '';
        const location = document.getElementById('location').value;
        const sectionsData = getSectionsData();
        const videoData = parseVideoUrl(videoUrl);

        if (!title || !body) {
            showNotification('⚠️ Please fill in at least the Title and Message Body', 'error');
            return;
        }

        // Build plain text content
        let textContent = '';
        
        if (monthYear) {
            textContent += `${monthYear}\n`;
            textContent += '='.repeat(monthYear.length) + '\n\n';
        }
        
        textContent += `${title}\n`;
        textContent += '='.repeat(title.length) + '\n\n';
        
        if (subtitle) {
            textContent += `${subtitle}\n\n`;
        }
        
        textContent += `${body}\n\n`;
        
        if (videoData) {
            textContent += `VIDEO: ${videoData.watchUrl}\n\n`;
        }
        
        if (ctaText && ctaLink) {
            textContent += `${ctaText}: ${ctaLink}\n\n`;
        }
        
        sectionsData.forEach(section => {
            textContent += `${section.title}\n`;
            textContent += '-'.repeat(section.title.length) + '\n';
            textContent += `${section.body}\n\n`;
        });
        
        if (location) {
            textContent += `Location: ${location}\n`;
        }
        
        textContent += `\n---\nGenerated by IBM Marketing Comms, UKI\n`;

        // Create and download file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `comm-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✅ Plain text file exported successfully!', 'success');
    }

    // Export to PDF (using print dialog)
    function exportToPDF() {
        console.log('exportToPDF function called');
        const monthYear = document.getElementById('monthYear').value;
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = getBodyContent();
        const ctaText = document.getElementById('ctaText').value;
        const ctaLink = document.getElementById('ctaLink').value;
        const videoUrlElement = document.getElementById('videoUrl');
        const videoUrl = videoUrlElement ? videoUrlElement.value : '';
        const location = document.getElementById('location').value;
        const sectionsData = getSectionsData();
        const videoData = parseVideoUrl(videoUrl);
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        const titleColor = document.getElementById('titleColor').value;
        const bodyColor = document.getElementById('bodyColor').value;
        const subtitleColor = document.getElementById('subtitleColor').value;
        const ctaColor = document.getElementById('ctaColor').value;

        if (!title || !body) {
            showNotification('⚠️ Please fill in at least the Title and Message Body', 'error');
            return;
        }

        // Create a new window with the content
        const printWindow = window.open('', '_blank');
        
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #161616;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
        }
        .email-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            padding: 20px 0;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 20px;
        }
        .month-year {
            font-size: 14px;
            color: #525252;
        }
        .main-title {
            font-size: 32px;
            font-weight: 600;
            color: ${titleColor};
            margin: 20px 0 10px 0;
            line-height: 1.2;
        }
        .subtitle {
            font-size: 18px;
            font-style: italic;
            color: ${subtitleColor};
            margin: 0 0 20px 0;
        }
        .content {
            font-size: ${fontSize};
            color: ${bodyColor};
        }
        .content p {
            margin: 0 0 16px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${ctaColor};
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            border-radius: 4px;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: ${titleColor};
            margin: 30px 0 15px 0;
        }
        .section-content {
            font-size: ${fontSize};
            color: ${bodyColor};
            margin-bottom: 20px;
        }
        .banner-image {
            width: 600px;
            max-width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
            margin-bottom: 20px;
        }
        .footer-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #525252;
        }
        .inline-images img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px 0;
        }
        .print-instructions {
            background-color: #f4f4f4;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <strong>📑 PDF Export Instructions:</strong>
        <ol>
            <li>Press Ctrl+P (Windows) or Cmd+P (Mac) to open the print dialog</li>
            <li>Select "Save as PDF" or "Microsoft Print to PDF" as the printer</li>
            <li>Click "Save" or "Print" to save the PDF file</li>
        </ol>
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #0f62fe; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🖨️ Print / Save as PDF</button>
        <button onclick="window.close()" style="padding: 10px 20px; background-color: #525252; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">✕ Close</button>
    </div>
    
    <div class="email-container">
        ${bannerImageData ? `
        <img src="${bannerImageData.data}" class="banner-image" alt="Banner">
        ` : ''}
        
        <h1 class="main-title">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        ${monthYear ? `<div class="month-year" style="margin: 0 0 20px 0; font-size: 14px; color: #525252;">${monthYear}</div>` : ''}
        
        <div class="content">
            <p>${body.replace(/\n/g, '</p><p>')}</p>
            
            ${videoData ? generateVideoHtml(videoData) : ''}
            
            ${ctaText && ctaLink ? `<div class="cta-button">${ctaText} → ${ctaLink}</div>` : ''}
            
            ${sectionsData.map(section => `
                <div class="section-title">${section.title}</div>
                <div class="section-content">${section.body.replace(/\n/g, '</p><p>')}</div>
            `).join('')}
            
            ${inlineImagesData.length > 0 ? `
            <div class="inline-images">
                ${inlineImagesData.map(img => `<img src="${img.data}" alt="${img.name}">`).join('\n')}
            </div>
            ` : ''}
            
            ${location ? `<div class="footer-info"><p><strong>Location:</strong> ${location}</p></div>` : ''}
        </div>
    </div>
    
    <script>
        // Auto-print after a short delay to ensure images load
        setTimeout(function() {
            // Uncomment the line below to auto-open print dialog
            // window.print();
        }, 500);
    </script>
</body>
</html>`;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        showNotification('✅ PDF export window opened! Use the print dialog to save as PDF.', 'success');
    }
});

    // Slack Integration Function
    function postToSlack() {
        const webhookUrl = document.getElementById('slackWebhook') ? document.getElementById('slackWebhook').value.trim() : '';
        const channel = document.getElementById('slackChannel') ? document.getElementById('slackChannel').value.trim() : '';
        const includeImages = document.getElementById('slackIncludeImages') ? document.getElementById('slackIncludeImages').checked : true;
        const slackStatus = document.getElementById('slackStatus');

        if (!webhookUrl) {
            showNotification('⚠️ Please enter a Slack webhook URL', 'error');
            return;
        }

        // Get form data
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const body = getBodyContent();
        const ctaText = document.getElementById('ctaText').value;
        const ctaLink = document.getElementById('ctaLink').value;
        const location = document.getElementById('location').value;

        if (!title || !body) {
            showNotification('⚠️ Please fill in at least the Title and Message Body', 'error');
            return;
        }

        // Show loading status
        if (slackStatus) {
            slackStatus.textContent = '⏳ Posting to Slack...';
            slackStatus.className = 'slack-status loading';
            slackStatus.classList.remove('hidden');
        }

        // Build Slack message
        const slackMessage = {
            text: title,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: title,
                        emoji: true
                    }
                }
            ]
        };

        // Add channel override if specified
        if (channel) {
            slackMessage.channel = channel;
        }

        // Add subtitle
        if (subtitle) {
            slackMessage.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `_${subtitle}_`
                }
            });
        }

        // Add body (convert HTML to Slack markdown)
        const bodyText = body.replace(/<[^>]*>/g, '').substring(0, 3000); // Strip HTML and limit length
        slackMessage.blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: bodyText
            }
        });

        // Add CTA button
        if (ctaText && ctaLink) {
            slackMessage.blocks.push({
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: ctaText,
                            emoji: true
                        },
                        url: ctaLink,
                        style: 'primary'
                    }
                ]
            });
        }

        // Add location
        if (location) {
            slackMessage.blocks.push({
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `📍 ${location}`
                    }
                ]
            });
        }

        // Add banner image if available and requested
        if (includeImages && bannerImageData) {
            slackMessage.blocks.push({
                type: 'image',
                image_url: bannerImageData.data,
                alt_text: 'Banner image'
            });
        }

        // Send to Slack
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(slackMessage)
        })
        .then(response => {
            if (response.ok) {
                if (slackStatus) {
                    slackStatus.textContent = '✅ Successfully posted to Slack!';
                    slackStatus.className = 'slack-status success';
                }
                showNotification('✅ Posted to Slack successfully!', 'success');
                setTimeout(() => {
                    if (slackModal) {
                        slackModal.classList.add('hidden');
                    }
                }, 2000);
            } else {
                throw new Error('Failed to post to Slack');
            }
        })
        .catch(error => {
            console.error('Slack error:', error);
            if (slackStatus) {
                slackStatus.textContent = '❌ Failed to post to Slack. Please check your webhook URL and try again.';
                slackStatus.className = 'slack-status error';
            }
            showNotification('⚠️ Failed to post to Slack', 'error');
        });
    }

    // Load Template Function
    window.loadTemplate = function(templateType) {
        const templates = {
            announcement: {
                title: 'Important Company Announcement',
                subtitle: 'Updates from Leadership',
                monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                body: `<p>We are excited to share some important updates with you.</p>
<p><strong>Key Points:</strong></p>
<ul>
<li>Strategic initiative launched to drive innovation</li>
<li>New opportunities for team collaboration</li>
<li>Enhanced focus on customer success</li>
</ul>
<p>We appreciate your continued dedication and look forward to achieving great things together.</p>`,
                ctaText: 'Learn More',
                ctaLink: 'https://example.com',
                location: ''
            },
            newsletter: {
                title: 'Monthly Newsletter',
                subtitle: 'Your source for the latest updates and insights',
                monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                body: `<p>Welcome to this month's newsletter! Here's what's happening:</p>
<p><strong>In This Issue:</strong></p>
<ul>
<li>Feature spotlight: New capabilities</li>
<li>Team achievements and milestones</li>
<li>Upcoming events and opportunities</li>
<li>Industry insights and trends</li>
</ul>`,
                sections: [
                    { title: 'Feature Spotlight', body: 'Discover the latest features and enhancements designed to improve your experience.' },
                    { title: 'Team Highlights', body: 'Celebrating our team\'s achievements and recognizing outstanding contributions.' },
                    { title: 'Upcoming Events', body: 'Mark your calendars for these exciting events and opportunities to connect.' }
                ],
                ctaText: 'Read Full Newsletter',
                ctaLink: 'https://example.com/newsletter',
                location: ''
            },
            event: {
                title: 'You\'re Invited: Annual Tech Summit 2026',
                subtitle: 'Join us for an inspiring day of innovation and networking',
                monthYear: 'June 15, 2026',
                body: `<p>We're thrilled to invite you to our Annual Tech Summit!</p>
<p><strong>Event Highlights:</strong></p>
<ul>
<li>Keynote presentations from industry leaders</li>
<li>Interactive workshops and breakout sessions</li>
<li>Networking opportunities with peers</li>
<li>Product demonstrations and hands-on experiences</li>
</ul>
<p><strong>When:</strong> June 15, 2026 | 9:00 AM - 5:00 PM<br>
<strong>Where:</strong> IBM Innovation Center, London</p>
<p>Don't miss this opportunity to connect, learn, and be inspired!</p>`,
                ctaText: 'Register Now',
                ctaLink: 'https://example.com/register',
                location: 'IBM Innovation Center, London, UK'
            },
            product: {
                title: 'Introducing Our Latest Innovation',
                subtitle: 'Transforming the way you work',
                monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                body: `<p>We're excited to announce the launch of our groundbreaking new product!</p>
<p><strong>Key Features:</strong></p>
<ul>
<li>Advanced AI-powered capabilities</li>
<li>Seamless integration with existing tools</li>
<li>Enhanced security and compliance</li>
<li>Intuitive user experience</li>
</ul>
<p><strong>Why It Matters:</strong></p>
<p>This innovation represents a significant leap forward in productivity and efficiency, designed specifically to address your most pressing challenges.</p>`,
                sections: [
                    { title: 'Technical Specifications', body: 'Built on cutting-edge technology with enterprise-grade reliability and scalability.' },
                    { title: 'Pricing & Availability', body: 'Available now with flexible pricing options to suit organizations of all sizes.' }
                ],
                ctaText: 'Get Started Today',
                ctaLink: 'https://example.com/product',
                location: ''
            },
            'team-update': {
                title: 'Team Update: Q2 2026',
                subtitle: 'Celebrating our achievements and looking ahead',
                monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                body: `<p>Hello Team!</p>
<p>As we wrap up another successful quarter, I wanted to take a moment to recognize our collective achievements and share some exciting updates.</p>
<p><strong>Q2 Highlights:</strong></p>
<ul>
<li>Successfully delivered 3 major projects ahead of schedule</li>
<li>Achieved 95% customer satisfaction rating</li>
<li>Welcomed 5 new team members</li>
<li>Completed important training initiatives</li>
</ul>`,
                sections: [
                    { title: 'Team Recognition', body: 'Special congratulations to our outstanding performers this quarter. Your dedication makes all the difference!' },
                    { title: 'Looking Ahead', body: 'Q3 brings exciting new opportunities and challenges. Let\'s continue our momentum!' }
                ],
                ctaText: 'View Full Report',
                ctaLink: 'https://example.com/report',
                location: ''
            },
            welcome: {
                title: 'Welcome to the Team!',
                subtitle: 'We\'re thrilled to have you here',
                monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                body: `<p>Welcome aboard! We're excited to have you join our team.</p>
<p><strong>Getting Started:</strong></p>
<ul>
<li>Complete your onboarding checklist</li>
<li>Set up your workspace and tools</li>
<li>Meet your team members</li>
<li>Review key resources and documentation</li>
</ul>
<p>Your journey with us begins today, and we're here to support you every step of the way. Don't hesitate to reach out if you have any questions!</p>`,
                sections: [
                    { title: 'First Week Essentials', body: 'Access your welcome kit, schedule 1-on-1 meetings, and familiarize yourself with our tools and processes.' },
                    { title: 'Resources & Support', body: 'Find helpful guides, training materials, and contact information for your team leads and HR.' }
                ],
                ctaText: 'Access Onboarding Portal',
                ctaLink: 'https://example.com/onboarding',
                location: ''
            }
        };

        const template = templates[templateType];
        if (!template) {
            showNotification('⚠️ Template not found', 'error');
            return;
        }

        // Clear form first
        const form = document.getElementById('commForm');
        if (form) {
            form.reset();
        }

        // Load template data
        const titleEl = document.getElementById('title');
        const subtitleEl = document.getElementById('subtitle');
        const monthYearEl = document.getElementById('monthYear');
        const ctaTextEl = document.getElementById('ctaText');
        const ctaLinkEl = document.getElementById('ctaLink');
        const locationEl = document.getElementById('location');
        
        if (titleEl) titleEl.value = template.title;
        if (subtitleEl) subtitleEl.value = template.subtitle;
        if (monthYearEl) monthYearEl.value = template.monthYear;
        
        // Set body content
        if (window.setBodyContent) {
            window.setBodyContent(template.body);
        } else {
            const bodyEl = document.getElementById('body');
            if (bodyEl) bodyEl.innerHTML = template.body;
        }
        
        if (template.ctaText && ctaTextEl) {
            ctaTextEl.value = template.ctaText;
        }
        if (template.ctaLink && ctaLinkEl) {
            ctaLinkEl.value = template.ctaLink;
        }
        if (template.location && locationEl) {
            locationEl.value = template.location;
        }

        // Clear existing sections
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (sectionsContainer) {
            sectionsContainer.innerHTML = '';
            // Reset section tracking (these are global)
            if (window.sections) window.sections = [];
            if (window.sectionCounter !== undefined) window.sectionCounter = 0;
        }

        // Add template sections if any
        if (template.sections && template.sections.length > 0) {
            template.sections.forEach(section => {
                if (window.addSection) {
                    window.addSection();
                    const currentCounter = window.sectionCounter || 0;
                    const titleEl = document.getElementById(`sectionTitle${currentCounter}`);
                    const bodyEl = document.getElementById(`sectionBody${currentCounter}`);
                    if (titleEl) titleEl.value = section.title;
                    if (bodyEl) bodyEl.value = section.body;
                }
            });
        }

        // Clear images (these are global)
        if (window.bannerImageData !== undefined) window.bannerImageData = null;
        if (window.inlineImagesData) window.inlineImagesData = [];
        
        const bannerPreview = document.getElementById('bannerPreview');
        if (bannerPreview) {
            bannerPreview.classList.add('hidden');
        }
        
        const inlinePreview = document.getElementById('inlinePreview');
        if (inlinePreview) {
            inlinePreview.innerHTML = '';
        }

        // Switch to Create Comm tab
        if (window.switchTab) {
            window.switchTab('create');
        }
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(`✅ Template "${template.title}" loaded successfully!`, 'success');
        }
    }

    // ===================================
    // EVENT LIBRARY FUNCTIONALITY
    // ===================================

    // Checkbox selection functionality
    const availableEvents = document.getElementById('availableEvents');
    const selectedCountSpan = document.getElementById('selectedCount');
    let selectedEvents = [];

    // Update selected count display
    function updateSelectedCount() {
        if (selectedCountSpan) {
            selectedCountSpan.textContent = selectedEvents.length;
        }
    }

    if (availableEvents) {
        // Handle checkbox changes
        const checkboxes = availableEvents.querySelectorAll('.event-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const eventItem = this.closest('.event-checkbox-item');
                const eventId = eventItem.dataset.eventId;
                
                if (this.checked) {
                    // Add to selected events
                    if (!selectedEvents.includes(eventId)) {
                        selectedEvents.push(eventId);
                        eventItem.classList.add('checked');
                    }
                } else {
                    // Remove from selected events
                    selectedEvents = selectedEvents.filter(id => id !== eventId);
                    eventItem.classList.remove('checked');
                }
                
                updateSelectedCount();
            });
        });
    }

    // Clear selected events
    const clearSelectedBtn = document.getElementById('clearSelectedEvents');
    if (clearSelectedBtn) {
        clearSelectedBtn.addEventListener('click', function() {
            if (selectedEvents.length === 0) {
                showNotification('No events selected', 'error');
                return;
            }
            
            // Uncheck all checkboxes
            const checkboxes = availableEvents.querySelectorAll('.event-checkbox:checked');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.closest('.event-checkbox-item').classList.remove('checked');
            });
            
            selectedEvents = [];
            updateSelectedCount();
            showNotification('✅ Selection cleared', 'success');
        });
    }

    // Store generated content globally for export
    let generatedCommContent = '';

    // Create communication from selected events
    const createCommBtn = document.getElementById('createCommFromEvents');
    const eventPreviewSection = document.getElementById('eventPreviewSection');
    const eventPreviewContent = document.getElementById('eventPreviewContent');
    const eventSelectionContainer = document.querySelector('.event-selection-container');
    
    if (createCommBtn) {
        createCommBtn.addEventListener('click', function() {
            if (selectedEvents.length === 0) {
                showNotification('⚠️ Please select at least one event', 'error');
                return;
            }
            
            // Get selected event items
            let eventsContent = '';
            
            selectedEvents.forEach((eventId, index) => {
                const eventItem = availableEvents.querySelector(`.event-checkbox-item[data-event-id="${eventId}"]`);
                if (eventItem) {
                    const title = eventItem.querySelector('h5').textContent;
                    const date = eventItem.querySelector('.event-date').textContent;
                    const description = eventItem.querySelector('.event-description').textContent;
                    
                    eventsContent += `
                        <h3>${title}</h3>
                        <p><strong>${date}</strong></p>
                        <p>${description}</p>
                        ${index < selectedEvents.length - 1 ? '<hr>' : ''}
                    `;
                }
            });
            
            // Generate full content
            generatedCommContent = `
                <h1>Upcoming Events for You</h1>
                <h2>Exclusive opportunities tailored to your interests</h2>
                <p>Dear Valued Client,</p>
                <p>We're excited to share these upcoming events that we believe will be of great interest to you:</p>
                ${eventsContent}
                <p>We look forward to seeing you at these events!</p>
                <p>Best regards,<br>Your IBM Team</p>
            `;
            
            // Show preview section
            if (eventPreviewContent) {
                eventPreviewContent.innerHTML = generatedCommContent;
            }
            
            // Hide selection, show preview
            if (eventSelectionContainer) {
                eventSelectionContainer.style.display = 'none';
            }
            if (eventPreviewSection) {
                eventPreviewSection.classList.remove('hidden');
            }
            
            // Scroll to preview
            eventPreviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            showNotification('✅ Communication generated! Review and export below.', 'success');
        });
    }

    // Back to selection button
    const backToSelectionBtn = document.getElementById('backToSelection');
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            // Show selection, hide preview
            if (eventSelectionContainer) {
                eventSelectionContainer.style.display = 'block';
            }
            if (eventPreviewSection) {
                eventPreviewSection.classList.add('hidden');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Preview in modal button
    const previewCommBtn = document.getElementById('previewCommBtn');
    if (previewCommBtn) {
        previewCommBtn.addEventListener('click', function() {
            const previewModal = document.getElementById('previewModal');
            const previewFrame = document.getElementById('previewFrame');
            
            if (previewModal && previewFrame) {
                // Generate full HTML for preview
                const fullHTML = generateEmailHTML(
                    '',  // monthYear
                    'Upcoming Events for You',  // title
                    'Exclusive opportunities tailored to your interests',  // subtitle
                    generatedCommContent,  // body
                    '',  // ctaText
                    '',  // ctaLink
                    'IBM Plex Sans',  // fontFamily
                    '16px',  // fontSize
                    '#161616',  // titleColor
                    '#161616',  // bodyColor
                    '#0f62fe',  // ctaColor
                    null,  // bannerImage
                    [],  // sections
                    [],  // inlineImages
                    ''  // videoUrl
                );
                
                previewFrame.srcdoc = fullHTML;
                previewModal.classList.remove('hidden');
            }
        });
    }

    // Export communication button
    const exportCommBtn = document.getElementById('exportCommBtn');
    if (exportCommBtn) {
        exportCommBtn.addEventListener('click', function() {
            // Generate email content
            const emlContent = generateEMLContent(
                '',  // monthYear
                'Upcoming Events for You',  // title
                'Exclusive opportunities tailored to your interests',  // subtitle
                generatedCommContent,  // body
                '',  // ctaText
                '',  // ctaLink
                'IBM Plex Sans',  // fontFamily
                '16px',  // fontSize
                '#161616',  // titleColor
                '#161616',  // bodyColor
                '#0f62fe',  // ctaColor
                null,  // bannerImage
                [],  // sections
                [],  // inlineImages
                ''  // videoUrl
            );
            
            // Create and download file
            const blob = new Blob([emlContent], { type: 'message/rfc822' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'upcoming-events-communication.eml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('✅ Communication exported successfully!', 'success');
        });
    }

    // Event filters
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    const eventBrandFilter = document.getElementById('eventBrandFilter');
    
    function filterEvents() {
        if (!availableEvents) return;
        
        const typeFilter = eventTypeFilter ? eventTypeFilter.value : 'all';
        const brandFilter = eventBrandFilter ? eventBrandFilter.value : 'all';
        
        const eventItems = availableEvents.querySelectorAll('.event-checkbox-item');
        
        eventItems.forEach(item => {
            const itemType = item.dataset.type;
            const itemBrand = item.dataset.brand;
            
            const typeMatch = typeFilter === 'all' || itemType === typeFilter;
            const brandMatch = brandFilter === 'all' || itemBrand === brandFilter;
            
            if (typeMatch && brandMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    if (eventTypeFilter) {
        eventTypeFilter.addEventListener('change', filterEvents);
    }
    
    if (eventBrandFilter) {
        eventBrandFilter.addEventListener('change', filterEvents);
    }

    // Helper function to add event to seller list (for future use when marketing adds events externally)
    function addEventToSellerList(event) {
        if (!availableEvents) return;
        
        const card = document.createElement('div');
        card.className = 'event-card';
        card.draggable = true;
        card.dataset.eventId = event.id;
        card.innerHTML = `
            <div class="event-drag-handle">⋮⋮</div>
            <div class="event-content">
                <div class="event-badge ${event.brand}">${getBrandName(event.brand)}</div>
                <h5>${event.title}</h5>
                <p class="event-date">📅 ${event.date} | ${event.location}</p>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <span class="event-type">${event.type}</span>
                    <span class="event-audience">${event.audience}</span>
                </div>
            </div>
        `;
        
        // Add drag events
        card.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
        
        availableEvents.appendChild(card);
    }

    // Helper function to get brand name
    function getBrandName(brand) {
        const brands = {
            'cloud': 'IBM Cloud',
            'watson': 'IBM Watson',
            'security': 'IBM Security',
            'consulting': 'IBM Consulting'
        };
        return brands[brand] || brand;
    }

    // Load saved events on page load
    function loadSavedEvents() {
        const events = JSON.parse(localStorage.getItem('marketingEvents') || '[]');
        events.forEach(event => {
            addEventToSellerList(event);
        });
    }

    // Initialize
    loadSavedEvents();


// Made with Bob
