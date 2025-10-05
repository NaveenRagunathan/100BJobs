import { NextRequest, NextResponse } from 'next/server';
import { parseJsonFile, validateCandidateData } from '@/lib/parsers/jsonParser';
import { detectSchema } from '@/lib/parsers/schemaDetector';
import { normalizeCandidates } from '@/lib/parsers/candidateNormalizer';
import { validateFileSize, validateJsonStructure, hashFile, generateSessionId } from '@/lib/utils/fileUtils';
import { cacheManager } from '@/lib/utils/cacheManager';

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only JSON files are supported' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse JSON
    let rawCandidates;
    try {
      rawCandidates = await parseJsonFile(fileContent);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to parse JSON: ${error.message}` },
        { status: 400 }
      );
    }

    // Validate candidate data
    const validation = validateCandidateData(rawCandidates);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate JSON structure
    const structureValidation = validateJsonStructure(rawCandidates);
    if (!structureValidation.valid) {
      return NextResponse.json(
        { error: structureValidation.error },
        { status: 400 }
      );
    }

    // Detect schema
    const schema = detectSchema(rawCandidates);

    // Normalize candidates
    const normalizedCandidates = normalizeCandidates(rawCandidates, schema);

    // Generate file hash for caching
    const fileHash = await hashFile(fileContent);

    // Generate session ID
    const sessionId = generateSessionId();

    // Store in cache
    const ttlMinutes = parseInt(process.env.CACHE_TTL_MINUTES || '60');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    cacheManager.setSession(sessionId, {
      sessionId,
      candidates: normalizedCandidates,
      fileHash,
      uploadedAt: new Date(),
      expiresAt
    });

    return NextResponse.json({
      success: true,
      sessionId,
      stats: {
        total: normalizedCandidates.length,
        withEmail: validation.stats.withEmail,
        withName: validation.stats.withName
      },
      detectedFields: {
        nameFields: schema.nameFields,
        emailFields: schema.emailFields,
        skillFields: schema.skillFields,
        experienceFields: schema.experienceFields
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}
