/**
 * Fluent builder for constructing Embed objects with validation.
 * Mirrors Fluxer.Net/EmbedBuilder.
 */
import type { Embed, EmbedFooter, EmbedAuthor, EmbedField, EmbedMedia } from "../types/models.js";

// ── Validation constants ────────────────────────────────────────────────────

export const MaxTitleLength = 256;
export const MaxDescriptionLength = 4096;
export const MaxFieldCount = 25;
export const MaxFieldNameLength = 256;
export const MaxFieldValueLength = 1024;
export const MaxFooterTextLength = 2048;
export const MaxAuthorNameLength = 256;
export const MaxEmbedLength = 6000;

// ── Sub-builders ────────────────────────────────────────────────────────────

export class EmbedAuthorBuilder {
  name: string;
  url?: string;
  icon_url?: string;

  constructor(name: string) {
    if (name.length > MaxAuthorNameLength) {
      throw new RangeError(`Author name exceeds ${MaxAuthorNameLength} characters.`);
    }
    this.name = name;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setIconUrl(iconUrl: string): this {
    this.icon_url = iconUrl;
    return this;
  }

  build(): EmbedAuthor {
    return {
      name: this.name,
      url: this.url,
      icon_url: this.icon_url,
    };
  }
}

export class EmbedFooterBuilder {
  text: string;
  icon_url?: string;

  constructor(text: string) {
    if (text.length > MaxFooterTextLength) {
      throw new RangeError(`Footer text exceeds ${MaxFooterTextLength} characters.`);
    }
    this.text = text;
  }

  setIconUrl(iconUrl: string): this {
    this.icon_url = iconUrl;
    return this;
  }

  build(): EmbedFooter {
    return {
      text: this.text,
      icon_url: this.icon_url,
    };
  }
}

export class EmbedFieldBuilder {
  name: string;
  value: string;
  inline?: boolean;

  constructor(name: string, value: string, inline?: boolean) {
    if (name.length > MaxFieldNameLength) {
      throw new RangeError(`Field name exceeds ${MaxFieldNameLength} characters.`);
    }
    if (value.length > MaxFieldValueLength) {
      throw new RangeError(`Field value exceeds ${MaxFieldValueLength} characters.`);
    }
    this.name = name;
    this.value = value;
    this.inline = inline;
  }

  build(): EmbedField {
    return {
      name: this.name,
      value: this.value,
      inline: this.inline,
    };
  }
}

// ── EmbedBuilder ────────────────────────────────────────────────────────────

export class EmbedBuilder {
  private _title?: string;
  private _description?: string;
  private _url?: string;
  private _timestamp?: string;
  private _color?: number;
  private _footer?: EmbedFooter;
  private _image?: EmbedMedia;
  private _thumbnail?: EmbedMedia;
  private _author?: EmbedAuthor;
  private _fields: EmbedField[] = [];

  /** Set the embed title (max 256 characters). */
  setTitle(title: string): this {
    if (title == null) {
      throw new TypeError("Title must be a string, received " + typeof title);
    }
    if (title.length > MaxTitleLength) {
      throw new RangeError(`Title exceeds ${MaxTitleLength} characters.`);
    }
    this._title = title;
    return this;
  }

  /** Set the embed description (max 4096 characters). */
  setDescription(description: string): this {
    if (description == null) {
      throw new TypeError("Description must be a string, received " + typeof description);
    }
    if (description.length > MaxDescriptionLength) {
      throw new RangeError(`Description exceeds ${MaxDescriptionLength} characters.`);
    }
    this._description = description;
    return this;
  }

  /** Set the embed URL (makes the title clickable). */
  setUrl(url: string): this {
    this._url = url;
    return this;
  }

  /** Set the embed timestamp. Accepts a Date, ISO string, or nothing for "now". */
  setTimestamp(date?: Date | string): this {
    if (date instanceof Date) {
      this._timestamp = date.toISOString();
    } else if (typeof date === "string") {
      this._timestamp = date;
    } else {
      this._timestamp = new Date().toISOString();
    }
    return this;
  }

  /** Set the embed colour (decimal integer, e.g. 0x00AAFF). */
  setColor(color: number): this {
    this._color = color;
    return this;
  }

  /** Set the embed footer. */
  setFooter(text: string, iconUrl?: string): this {
    const fb = new EmbedFooterBuilder(text);
    if (iconUrl) fb.setIconUrl(iconUrl);
    this._footer = fb.build();
    return this;
  }

  /** Set the embed image. */
  setImage(url: string): this {
    this._image = { url };
    return this;
  }

  /** Set the embed thumbnail. */
  setThumbnail(url: string): this {
    this._thumbnail = { url };
    return this;
  }

  /** Set the embed author. */
  setAuthor(name: string, url?: string, iconUrl?: string): this {
    const ab = new EmbedAuthorBuilder(name);
    if (url) ab.setUrl(url);
    if (iconUrl) ab.setIconUrl(iconUrl);
    this._author = ab.build();
    return this;
  }

  /** Add a field to the embed (max 25 fields). */
  addField(name: string, value: string, inline?: boolean): this {
    if (this._fields.length >= MaxFieldCount) {
      throw new RangeError(`Cannot add more than ${MaxFieldCount} fields.`);
    }
    const fb = new EmbedFieldBuilder(name, value, inline);
    this._fields.push(fb.build());
    return this;
  }

  /** Add multiple fields at once. */
  addFields(...fields: { name: string; value: string; inline?: boolean }[]): this {
    for (const f of fields) {
      this.addField(f.name, f.value, f.inline);
    }
    return this;
  }

  /** Calculate the total character count across all text fields. */
  private _totalLength(): number {
    let total = 0;
    if (this._title) total += this._title.length;
    if (this._description) total += this._description.length;
    if (this._footer) total += this._footer.text.length;
    if (this._author) total += this._author.name.length;
    for (const f of this._fields) {
      total += f.name.length + f.value.length;
    }
    return total;
  }

  /**
   * Build and validate the Embed object.
   * Throws if the total embed length exceeds 6000 characters.
   */
  build(): Embed {
    const totalLen = this._totalLength();
    if (totalLen > MaxEmbedLength) {
      throw new RangeError(
        `Total embed length (${totalLen}) exceeds the maximum of ${MaxEmbedLength} characters.`,
      );
    }

    const embed: Embed = {};

    if (this._title !== undefined) embed.title = this._title;
    if (this._description !== undefined) embed.description = this._description;
    if (this._url !== undefined) embed.url = this._url;
    if (this._timestamp !== undefined) embed.timestamp = this._timestamp;
    if (this._color !== undefined) embed.color = this._color;
    if (this._footer !== undefined) embed.footer = this._footer;
    if (this._image !== undefined) embed.image = this._image;
    if (this._thumbnail !== undefined) embed.thumbnail = this._thumbnail;
    if (this._author !== undefined) embed.author = this._author;
    if (this._fields.length > 0) embed.fields = this._fields;

    return embed;
  }
}
