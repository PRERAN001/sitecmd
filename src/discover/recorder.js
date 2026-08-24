import { createNetworkInspector } from "./network.js";

export async function createRecorder(page) {
    const network = createNetworkInspector(page);
    const actions = [];

    await page.exposeFunction(
        "__sitecmd_record_action",
        (action) => {
            actions.push({
                ...action,
                timestamp: Date.now()
            });

            console.log(
                `Recorded: ${action.type}`,
                action.url || action.target?.text || ""
            );
        }
    );

    function handleNavigation(url) {
        if (!url || url === "about:blank") return;
        const lastAction = actions[actions.length - 1];
        if (
            lastAction &&
            lastAction.type === "navigate" &&
            lastAction.url === url
        ) {
            return;
        }

        actions.push({
            type: "navigate",
            url: url,
            timestamp: Date.now()
        });

        console.log(`Recorded: navigate ${url}`);
    }

    const onFrameNavigated = (frame) => {
        if (frame === page.mainFrame()) {
            handleNavigation(frame.url());
        }
    };

    page.on("framenavigated", onFrameNavigated);

    // Initial navigation recording if page is already loaded
    if (page.url() && page.url() !== "about:blank") {
        handleNavigation(page.url());
    }

    function installRecorderScript() {
        if (window.__sitecmd_recorder_installed) {
            return;
        }

        window.__sitecmd_recorder_installed = true;

        function escape(value) {
            if (window.CSS?.escape) {
                return CSS.escape(value);
            }

            return value.replace(
                /([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
                "\\$1"
            );
        }

        function buildCssPath(element) {
            const path = [];
            let current = element;

            while (
                current &&
                current.nodeType === Node.ELEMENT_NODE &&
                current !== document.body
            ) {
                let selector = current.tagName.toLowerCase();

                if (current.id) {
                    selector += `#${escape(current.id)}`;
                    path.unshift(selector);
                    break;
                }

                const parent = current.parentElement;

                if (parent) {
                    const sameTag = Array.from(parent.children).filter(
                        (child) => child.tagName === current.tagName
                    );

                    if (sameTag.length > 1) {
                        const index = sameTag.indexOf(current) + 1;
                        selector += `:nth-of-type(${index})`;
                    }
                }

                path.unshift(selector);
                current = current.parentElement;
            }

            return path.join(" > ");
        }

        function getSelector(element) {
            if (!element) {
                return null;
            }

            const testId = element.getAttribute("data-testid");
            if (testId) {
                return `[data-testid="${escape(testId)}"]`;
            }

            if (element.id) {
                return `#${escape(element.id)}`;
            }

            const name = element.getAttribute("name");
            if (name) {
                return `${element.tagName.toLowerCase()}[name="${escape(name)}"]`;
            }

            const ariaLabel = element.getAttribute("aria-label");
            if (ariaLabel) {
                return `${element.tagName.toLowerCase()}[aria-label="${escape(ariaLabel)}"]`;
            }

            const placeholder = element.getAttribute("placeholder");
            if (placeholder) {
                return `${element.tagName.toLowerCase()}[placeholder="${escape(placeholder)}"]`;
            }

            return buildCssPath(element);
        }

        function getElementInfo(element) {
            if (!element) {
                return {};
            }

            return {
                tag: element.tagName || null,
                text:
                    element.innerText
                        ?.trim()
                        ?.slice(0, 200) || null,
                id: element.id || null,
                name: element.getAttribute("name") || null,
                ariaLabel: element.getAttribute("aria-label") || null,
                placeholder: element.getAttribute("placeholder") || null,
                type: element.getAttribute("type") || null,
                href: element.href || null,
                selector: getSelector(element)
            };
        }

        document.addEventListener(
            "click",
            (event) => {
                let target = event.target;

                if (target && target.closest) {
                    const interactive = target.closest(
                        "button, a, input, select, textarea, [role='button'], [role='link']"
                    );

                    if (interactive) {
                        target = interactive;
                    }
                }

                window.__sitecmd_record_action({
                    type: "click",
                    target: getElementInfo(target)
                });
            },
            true
        );

        document.addEventListener(
            "input",
            (event) => {
                const target = event.target;

                window.__sitecmd_record_action({
                    type: "input",
                    target: {
                        ...getElementInfo(target),
                        value: target.value || ""
                    }
                });
            },
            true
        );

        document.addEventListener(
            "change",
            (event) => {
                const target = event.target;

                window.__sitecmd_record_action({
                    type: "change",
                    target: {
                        ...getElementInfo(target),
                        value: target.value || "",
                        checked:
                            target.type === "checkbox" ||
                            target.type === "radio"
                                ? target.checked
                                : null
                    }
                });
            },
            true
        );

        document.addEventListener(
            "submit",
            (event) => {
                const target = event.target;

                window.__sitecmd_record_action({
                    type: "submit",
                    target: getElementInfo(target)
                });
            },
            true
        );
    }

    await page.addInitScript(installRecorderScript);
    await page.evaluate(installRecorderScript);

    return {
        async getTrace() {
            return {
                actions: [...actions],
                network: network.getRequests()
            };
        },

        stop() {
            page.off("framenavigated", onFrameNavigated);
            network.stop();
        }
    };
}