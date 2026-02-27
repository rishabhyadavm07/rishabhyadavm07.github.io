document.addEventListener('DOMContentLoaded', () => {
    const warmupSection = document.getElementById('warmup-section');
    const cooldownSection = document.getElementById('cooldown-section');
    const muscleGroupsDisplay = document.getElementById('muscle-groups-display');
    const daySelectors = document.querySelectorAll('.day-selector');
    const lastUpdatedEl = document.getElementById('last-updated');

    let allExercises = [];
    const dayMuscleGroups = { A: [], B: [], C: [] };
    let activeDay = 'A'; // Default active day

    // --- Data Fetching and Initialization ---
    const init = async () => {
        try {
            // Path is relative to the root, as app.js is in the root
            const response = await fetch('workouts.yaml');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const yamlText = await response.text();
            const data = jsyaml.load(yamlText);
            allExercises = data.exercises || [];

            // Populate muscle groups for each day
            allExercises.forEach(ex => {
                if (dayMuscleGroups[ex.day] && !dayMuscleGroups[ex.day].includes(ex.muscle_group)) {
                    dayMuscleGroups[ex.day].push(ex.muscle_group);
                }
            });

            // Set initial state
            setActiveDay(activeDay);
            setupEventListeners();
            
            // Set last updated date
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            if (lastUpdatedEl) {
                lastUpdatedEl.textContent = `LAST UPDATED: ${formattedDate}`;
            }

        } catch (error) {
            console.error('Error fetching or parsing workout data:', error);
            warmupSection.innerHTML = `<p class="text-red-500 col-span-full">Error loading workout data. Please check the console and the 'workouts.yaml' file.</p>`;
        }
    };

    // --- DOM Rendering ---
    const renderExercises = (day) => {
        // Clear current content
        warmupSection.innerHTML = '';
        cooldownSection.innerHTML = '';

        const exercisesForDay = allExercises.filter(ex => ex.day === day);

        const warmups = exercisesForDay.filter(ex => ex.category === 'warmup');
        const cooldowns = exercisesForDay.filter(ex => ex.category === 'cooldown');

        if (warmups.length === 0) {
            warmupSection.innerHTML = `<p class="text-zinc-500 col-span-full">No warmup exercises defined for this day.</p>`;
        } else {
            warmups.forEach(ex => warmupSection.appendChild(createExerciseCard(ex)));
        }

        if (cooldowns.length === 0) {
            cooldownSection.innerHTML = `<p class="text-zinc-500 col-span-full">No cooldown exercises defined for this day.</p>`;
        } else {
            cooldowns.forEach(ex => cooldownSection.appendChild(createExerciseCard(ex)));
        }

        // Update muscle groups display
        if (muscleGroupsDisplay) {
            muscleGroupsDisplay.textContent = `MUSCLE GROUPS: ${dayMuscleGroups[day].join(' / ')}`;
        }

        // Re-initialize icons and lazy loading
        lucide.createIcons();
        setupLazyLoading();
    };

    const createExerciseCard = (exercise) => {
        const card = document.createElement('div');
        // Mimicking the style from the main site analysis
        card.className = 'bg-[#0a0a0a]/80 border border-zinc-800 rounded-md p-6 flex flex-col h-full shadow-lg hover:border-red-600/50 transition-all';

        const tipsList = (exercise.form_tips || []).map(tip => 
            `<li class="flex items-start gap-2">
                <i data-lucide="chevrons-right" class="text-red-600 w-4 h-4 flex-shrink-0 mt-1"></i>
                <span>${tip}</span>
            </li>`
        ).join('');

        const equipmentList = (exercise.equipment || []).map(item => 
            `<span class="flex items-center gap-2 text-zinc-400">
                <i data-lucide="weight" class="w-3 h-3 text-zinc-500"></i> ${item}
             </span>`
        ).join('');

        const notes = exercise.notes ? `
            <div class="mt-4 p-3 bg-yellow-900/10 border-l-4 border-yellow-500 text-yellow-300 text-sm font-light">
                <p class="flex items-center gap-2 font-bold text-yellow-400"><i data-lucide="edit-3" class="w-4 h-4"></i> Personal Note:</p>
                <p>${exercise.notes}</p>
            </div>` : '';

        // Note the relative path for the placeholder GIF
        const gifPath = exercise.gif_url || 'src/gifs/placeholder.gif';

        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-white tracking-tight">${exercise.name}</h3>
                    <span class="px-3 py-1 text-[10px] bg-zinc-900 border border-red-600/30 text-red-600 font-bold uppercase">${exercise.muscle_group}</span>
                </div>
                <div class="mb-4 aspect-video bg-black rounded flex items-center justify-center border border-zinc-800">
                    <img data-src="${gifPath}" alt="${exercise.name} animation" class="w-full h-full object-cover rounded lazy-load">
                </div>
                <p class="text-sm text-zinc-400 font-light mb-4 leading-relaxed">${exercise.description}</p>
                
                <!-- Accordion for Form Tips -->
                <div>
                    <button class="accordion-toggle flex items-center justify-between w-full text-left text-sm font-bold text-zinc-300 hover:text-red-600 transition-colors">
                        <span class="flex items-center gap-2"><i data-lucide="align-left"></i> Form Tips</span>
                        <i data-lucide="chevron-down" class="accordion-icon transition-transform"></i>
                    </button>
                    <div class="accordion-content mt-2">
                        <ul class="space-y-2 text-sm text-zinc-400 pl-2">${tipsList}</ul>
                    </div>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-zinc-800">
                <div class="flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div class="flex items-center gap-2 text-cyan-400">
                        <i data-lucide="clock" class="w-4 h-4"></i>
                        <span class="font-bold">${exercise.duration}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${equipmentList}
                    </div>
                </div>
                ${notes}
            </div>
        `;
        return card;
    };

    // --- Event Handling ---
    const setupEventListeners = () => {
        daySelectors.forEach(button => {
            button.addEventListener('click', () => setActiveDay(button.dataset.day));
        });

        // Use event delegation for accordions since cards are dynamically generated
        document.body.addEventListener('click', (e) => {
            const toggle = e.target.closest('.accordion-toggle');
            if (toggle) {
                const content = toggle.nextElementSibling;
                const icon = toggle.querySelector('.accordion-icon');
                content.classList.toggle('open');
                icon.classList.toggle('rotate-180');
            }
        });
    };

    const setActiveDay = (day) => {
        activeDay = day;
        daySelectors.forEach(button => {
            button.classList.toggle('active', button.dataset.day === day);
        });
        renderExercises(day);
    };

    // --- Utilities ---
    const setupLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    img.classList.add('lazy-loaded');
                    obs.unobserve(img);
                }
            });
        }, { rootMargin: "0px 0px 100px 0px" }); // Pre-load images 100px before they enter viewport

        lazyImages.forEach(img => observer.observe(img));
    };

    // --- Start the application ---
    init();
});
