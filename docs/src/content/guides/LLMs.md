---
title: LLMs
order: 8
---

<script>
  import OpenWithButton from "$lib/components/OpenWithButton.svelte";
</script>

The LayerChart documentation pages are designed to be accessible for humans developers using LLMs as well as large language models (LLMs) ingesting training data.

## :icon{name="lucide:user" class="relative -top-1"} For the Humans

<OpenWithButton example/>

At the top of each documentation page, and demonstrated above, you will find a button which copies the content of the page's documentation in Markdown to the clipboard. The convenient dropdown also gives you additional helpful options, such as viewing the component source or opening in chat.

::note
The option for `View Component Source` is only shown for component pages.
::

## :icon{name="lucide:bot" class="relative -top-1"} For the Bots

LayerChart adopts the [llms.txt](https://llmstxt.org/) proposal standard, which provides a structured, machine-readable format optimized for LLMs. This enables developers, researchers, and AI systems to efficiently parse and utilize our documentation.

::note
Most but not all pages support the `/llms.txt` suffix (i.e. those deemed irrelevant to LLMs).
::

## LLM-friendly documentation

::steps

### Per page / component

To access the LLM-friendly version of supported documentation pages, simply append `/llms.txt` to the end of the page's URL. This will return the content in a plain-text, LLM-optimized format. This is the same text which is copied to the clipboard when you click the `Copy Page` button.

:::tip
**Standard Page**: The LineChart component documentation is available at [/docs/components/LineChart](/docs/components/LineChart)

**LLM-friendly Version**: is available at [/docs/components/LineChart/llms.txt](/docs/components/LineChart/llms.txt)
:::

### Root index

To explore all supported pages in LLM-friendly format, visit the root index at [llms.txt](/llms.txt). This page provides a comprehensive list of available documentation endpoints compatible with the `llms.txt` standard.

### Complete documentation

For a complete, consolidated view of the all the documentation in an LLM-friendly format, navigate to [/docs/llms.txt](/docs/llms.txt). This single endpoint aggregates all documentation content into a machine-readable structure, ideal for bulk processing or ingestion into AI systems.

::
